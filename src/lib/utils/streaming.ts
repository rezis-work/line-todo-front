import { getAccessToken } from '@/lib/auth/token-store';
import type { SSEEvent } from '@/types/api';

export interface StreamChatCallbacks {
  onStart?: (sessionId: string) => void;
  onToken?: (content: string) => void;
  onDone?: (message: { id: string; role: 'user' | 'assistant'; content: string; createdAt: string }) => void;
  onError?: (error: string) => void;
}

/**
 * Stream chat response using Server-Sent Events (SSE)
 */
export async function streamChat(
  url: string,
  message: string,
  callbacks: StreamChatCallbacks
): Promise<void> {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    callbacks.onError?.('Not authenticated');
    return;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      callbacks.onError?.(errorText || `HTTP error! status: ${response.status}`);
      return;
    }

    if (!response.body) {
      callbacks.onError?.('No response body');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines (events are separated by \n\n)
        const lines = buffer.split('\n\n');
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6); // Remove 'data: ' prefix
              const event: SSEEvent = JSON.parse(jsonStr);

              switch (event.type) {
                case 'start':
                  callbacks.onStart?.(event.sessionId);
                  break;
                case 'token':
                  callbacks.onToken?.(event.content);
                  break;
                case 'done':
                  callbacks.onDone?.(event.message);
                  break;
                case 'error':
                  callbacks.onError?.(event.error);
                  return;
                default:
                  // Unknown event type, ignore
                  break;
              }
            } catch (parseError) {
              // Invalid JSON, skip this line
              console.warn('Failed to parse SSE event:', line);
            }
          }
        }
      }

      // Process any remaining buffer content
      if (buffer.trim()) {
        const lines = buffer.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              const event: SSEEvent = JSON.parse(jsonStr);

              switch (event.type) {
                case 'start':
                  callbacks.onStart?.(event.sessionId);
                  break;
                case 'token':
                  callbacks.onToken?.(event.content);
                  break;
                case 'done':
                  callbacks.onDone?.(event.message);
                  break;
                case 'error':
                  callbacks.onError?.(event.error);
                  break;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE event:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    callbacks.onError?.(errorMessage);
  }
}

