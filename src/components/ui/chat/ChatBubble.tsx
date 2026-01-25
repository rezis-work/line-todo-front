'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  userInitials?: string;
}

export function ChatBubble({
  role,
  content,
  isStreaming = false,
  userInitials,
}: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex w-full gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex max-w-[80%] flex-col gap-1',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-lg px-4 py-2',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          ) : (
            <ChatBubbleMessage content={content} isStreaming={isStreaming} />
          )}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            {userInitials ? (
              <span className="text-xs font-medium">{userInitials}</span>
            ) : (
              <User className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

interface ChatBubbleMessageProps {
  content: string;
  isStreaming?: boolean;
}

function ChatBubbleMessage({
  content,
  isStreaming = false,
}: ChatBubbleMessageProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-2 ml-4 list-disc last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 ml-4 list-decimal last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-1 last:mb-0">{children}</li>,
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                {children}
              </code>
            ) : (
              <code className="block rounded bg-muted p-2 text-xs font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto rounded bg-muted p-2 text-xs last:mb-0">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-4 border-muted-foreground/50 pl-4 italic last:mb-0">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => (
            <h1 className="mb-2 text-lg font-bold last:mb-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 text-base font-semibold last:mb-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 text-sm font-semibold last:mb-0">{children}</h3>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-current ml-1" />
      )}
    </div>
  );
}

