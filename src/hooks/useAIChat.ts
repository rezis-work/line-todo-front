'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGlobalChatHistory,
  getTaskChatHistory,
  clearGlobalChat,
  clearTaskChat,
  getGlobalChatStreamUrl,
  getTaskChatStreamUrl,
} from '@/lib/api/ai';
import { streamChat } from '@/lib/utils/streaming';
import type { ChatMessage } from '@/types/api';
import { useToast } from './use-toast';
import type { ApiError } from '@/types/api';
import { isApiError } from '@/lib/api/errors';

type ChatType = 'GLOBAL' | 'TASK';

interface UseAIChatOptions {
  chatType: ChatType;
  todoId?: string;
  limit?: number;
}

export function useAIChat({ chatType, todoId, limit = 50 }: UseAIChatOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Query key for history
  const historyQueryKey =
    chatType === 'GLOBAL'
      ? ['ai-chat', 'global', 'history']
      : ['ai-chat', 'task', todoId, 'history'];

  // Fetch chat history
  const {
    data: history,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: historyQueryKey,
    queryFn: () =>
      chatType === 'GLOBAL'
        ? getGlobalChatHistory(limit)
        : getTaskChatHistory(todoId!, limit),
    enabled: chatType === 'GLOBAL' || !!todoId,
  });

  // Update messages when history loads
  useEffect(() => {
    if (history) {
      setMessages(history.messages);
      setCurrentSessionId(history.sessionId);
    }
  }, [history]);

  // Clear history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: () =>
      chatType === 'GLOBAL' ? clearGlobalChat() : clearTaskChat(todoId!),
    onSuccess: () => {
      setMessages([]);
      setStreamingContent('');
      setCurrentSessionId(null);
      queryClient.invalidateQueries({ queryKey: historyQueryKey });
      toast({
        title: 'Success',
        description: 'Chat history cleared',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to clear chat history';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });

  // Send message function
  const sendMessage = useCallback(
    async (message: string) => {
      if (isStreaming) return;

      // Add user message optimistically
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: message,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingContent('');

      // Get stream URL
      const streamUrl =
        chatType === 'GLOBAL'
          ? getGlobalChatStreamUrl()
          : getTaskChatStreamUrl(todoId!);

      try {
        await streamChat(streamUrl, message, {
          onStart: (sessionId) => {
            setCurrentSessionId(sessionId);
          },
          onToken: (content) => {
            setStreamingContent((prev) => prev + content);
          },
          onDone: (assistantMessage) => {
            // Replace streaming content with final message
            setStreamingContent('');
            setMessages((prev) => [...prev, assistantMessage]);
            setIsStreaming(false);

            // Refetch history to get updated session
            refetchHistory();
          },
          onError: (error) => {
            setStreamingContent('');
            setIsStreaming(false);

            // Add error message to chat
            const errorMessage: ChatMessage = {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: `Error: ${error}`,
              createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMessage]);

            toast({
              title: 'Error',
              description: error,
              variant: 'destructive',
            });
          },
        });
      } catch (error) {
        setStreamingContent('');
        setIsStreaming(false);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
    [chatType, todoId, isStreaming, refetchHistory, toast]
  );

  const clearHistory = useCallback(() => {
    clearHistoryMutation.mutate();
  }, [clearHistoryMutation]);

  return {
    messages,
    streamingContent,
    isStreaming,
    isLoadingHistory,
    currentSessionId,
    sendMessage,
    clearHistory,
    isClearing: clearHistoryMutation.isPending,
  };
}

