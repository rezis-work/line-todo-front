'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
  maxLength = 4000,
}: ChatInputProps) {
  const [message, setMessage] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const remainingChars = maxLength - message.length;
  const isNearLimit = remainingChars < 100;

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={1}
            className={cn(
              'flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
              isNearLimit && 'border-warning'
            )}
          />
          {isNearLimit && (
            <span
              className={cn(
                'absolute bottom-1 right-2 text-xs',
                remainingChars < 0
                  ? 'text-destructive'
                  : remainingChars < 50
                    ? 'text-warning'
                    : 'text-muted-foreground'
              )}
            >
              {remainingChars}
            </span>
          )}
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !message.trim() || message.length > maxLength}
          className="shrink-0"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
}

