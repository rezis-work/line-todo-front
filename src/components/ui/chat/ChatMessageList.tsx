'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/api';
import { ChatBubble } from './ChatBubble';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessageListProps {
  messages: ChatMessage[];
  streamingContent?: string;
  className?: string;
}

export function ChatMessageList({
  messages,
  streamingContent,
  className,
}: ChatMessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Auto-scroll to bottom when messages change or streaming content updates
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const getUserInitials = () => {
    if (!user?.name) return undefined;
    const parts = user.name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.name[0]?.toUpperCase();
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-4 overflow-y-auto p-4',
        className
      )}
    >
      {messages.length === 0 && !streamingContent && (
        <div className="flex flex-1 items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">
            Start a conversation by sending a message below.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          role={message.role}
          content={message.content}
          userInitials={getUserInitials()}
        />
      ))}

      {streamingContent && (
        <ChatBubble
          role="assistant"
          content={streamingContent}
          isStreaming={true}
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

