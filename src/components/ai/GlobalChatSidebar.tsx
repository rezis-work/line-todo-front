'use client';

import { useState } from 'react';
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
import { Bot, Trash2, X } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface GlobalChatSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GlobalChatSidebar({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: GlobalChatSidebarProps) {
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
  } = useAIChat({ chatType: 'GLOBAL' });

  const handleClearConfirm = () => {
    clearHistory();
    setClearDialogOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col p-0">
          <SheetHeader className="px-4 pt-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <SheetTitle>AI Assistant</SheetTitle>
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
              Ask questions about your workspace, todos, and get AI-powered
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
              placeholder="Ask me anything about your workspace..."
            />
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        title="Clear Chat History"
        description="Are you sure you want to clear all chat history? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleClearConfirm}
      />
    </>
  );
}

// Floating button to toggle chat
export function GlobalChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-40"
        onClick={() => setOpen(true)}
      >
        <Bot className="h-5 w-5" />
      </Button>
      <GlobalChatSidebar open={open} onOpenChange={setOpen} />
    </>
  );
}

