import { api } from './client';
import { env } from '@/lib/env';
import type {
  ChatHistoryResponse,
} from '@/types/api';

/**
 * Get global chat history
 */
export async function getGlobalChatHistory(
  limit?: number
): Promise<ChatHistoryResponse> {
  const params = limit ? `?limit=${limit}` : '';
  return api.get<ChatHistoryResponse>(`/ai/chat/global/history${params}`);
}

/**
 * Get task-specific chat history
 */
export async function getTaskChatHistory(
  todoId: string,
  limit?: number
): Promise<ChatHistoryResponse> {
  const params = limit ? `?limit=${limit}` : '';
  return api.get<ChatHistoryResponse>(
    `/ai/chat/task/${todoId}/history${params}`
  );
}

/**
 * Clear global chat history
 */
export async function clearGlobalChat(): Promise<void> {
  return api.delete<void>('/ai/chat/global');
}

/**
 * Clear task-specific chat history
 */
export async function clearTaskChat(todoId: string): Promise<void> {
  return api.delete<void>(`/ai/chat/task/${todoId}`);
}

/**
 * Stream global chat (returns URL for SSE connection)
 */
export function getGlobalChatStreamUrl(): string {
  return `${env.NEXT_PUBLIC_API_URL}/ai/chat/global/stream`;
}

/**
 * Stream task chat (returns URL for SSE connection)
 */
export function getTaskChatStreamUrl(todoId: string): string {
  return `${env.NEXT_PUBLIC_API_URL}/ai/chat/task/${todoId}/stream`;
}

