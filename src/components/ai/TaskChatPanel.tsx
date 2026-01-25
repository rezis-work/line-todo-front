'use client';

import { useState, cloneElement, isValidElement } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChatMessageList } from '@/components/ui/chat/ChatMessageList';
import { ChatInput } from '@/components/ui/chat/ChatInput';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAIChat } from '@/hooks/useAIChat';
import { Bot, Trash2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface TaskChatPanelProps {
  todoId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode | null;
}

export function TaskChatPanel({
  todoId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger = undefined,
}: TaskChatPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen =
    controlledOnOpenChange !== undefined
      ? controlledOnOpenChange
      : setInternalOpen;

  const {
    messages,
    streamingContent,
    isStreaming,
    isLoadingHistory,
    sendMessage,
    clearHistory,
    isClearing,
  } = useAIChat({ chatType: 'TASK', todoId });

  const handleClearConfirm = () => {
    clearHistory();
    setClearDialogOpen(false);
  };

  // Render trigger button if trigger is undefined (default) or if trigger is provided
  const shouldRenderTrigger = trigger !== null;

  const handleTriggerClick = () => {
    setOpen(true);
  };

  // Clone trigger element and add onClick handler if it's a valid React element
  const triggerElement = trigger && isValidElement(trigger)
    ? cloneElement(
        trigger as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
        {
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            const originalOnClick = (trigger as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props?.onClick;
            if (originalOnClick) {
              originalOnClick(e);
            }
            handleTriggerClick();
          },
        } as Partial<React.HTMLAttributes<HTMLElement>>
      )
    : trigger;

  return (
    <>
      {shouldRenderTrigger && (
        <>
          {trigger ? (
            triggerElement
          ) : (
            <Button variant="outline" onClick={handleTriggerClick}>
              <Bot className="mr-2 h-4 w-4" />
              Chat about this task
            </Button>
          )}
        </>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col p-0">
          <SheetHeader className="px-4 pt-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <SheetTitle>Task Chat</SheetTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setClearDialogOpen(true)}
                  disabled={isClearing || messages.length === 0}
                  className="h-8 w-8"
                >
                  {isClearing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <SheetDescription>
              Ask questions about this specific task and get AI-powered
              assistance.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {isLoadingHistory ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ChatMessageList
                messages={messages}
                streamingContent={streamingContent}
                className="flex-1"
              />
            )}

            <ChatInput
              onSend={sendMessage}
              disabled={isStreaming || isLoadingHistory}
              placeholder="Ask about this task..."
            />
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        title="Clear Chat History"
        description="Are you sure you want to clear the chat history for this task? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleClearConfirm}
      />
    </>
  );
}

