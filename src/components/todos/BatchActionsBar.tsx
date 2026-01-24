'use client';

import { useState } from 'react';
import { TodoStatus, TodoPriority } from '@/types/api';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBatchUpdateTodos, useBatchDeleteTodos } from '@/hooks/useTodos';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, X } from 'lucide-react';

interface BatchActionsBarProps {
  workspaceId: string;
  selectedIds: string[];
  onClearSelection: () => void;
  members?: Array<{ userId: string; name: string | null; email: string }>;
}

export function BatchActionsBar({
  workspaceId,
  selectedIds,
  onClearSelection,
  members,
}: BatchActionsBarProps) {
  const batchUpdate = useBatchUpdateTodos(workspaceId);
  const batchDelete = useBatchDeleteTodos(workspaceId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleBatchUpdate = (
    field: 'status' | 'priority' | 'assignedToId',
    value: TodoStatus | TodoPriority | string | null
  ) => {
    batchUpdate.mutate(
      {
        todoIds: selectedIds,
        [field]: value,
      },
      {
        onSuccess: () => {
          onClearSelection();
        },
      }
    );
  };

  const handleBatchDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleBatchDeleteConfirm = () => {
    batchDelete.mutate(
      { todoIds: selectedIds },
      {
        onSuccess: () => {
          onClearSelection();
        },
      }
    );
  };

  if (selectedIds.length === 0) {
    return null;
  }

  const isLoading = batchUpdate.isPending || batchDelete.isPending;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border bg-background p-4 shadow-lg">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">
          {selectedIds.length} todo{selectedIds.length !== 1 ? 's' : ''} selected
        </span>

        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) =>
              handleBatchUpdate('status', value as TodoStatus)
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TodoStatus.TODO}>Todo</SelectItem>
              <SelectItem value={TodoStatus.IN_PROGRESS}>
                In Progress
              </SelectItem>
              <SelectItem value={TodoStatus.DONE}>Done</SelectItem>
              <SelectItem value={TodoStatus.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value) =>
              handleBatchUpdate('priority', value as TodoPriority)
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Update priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TodoPriority.LOW}>Low</SelectItem>
              <SelectItem value={TodoPriority.MEDIUM}>Medium</SelectItem>
              <SelectItem value={TodoPriority.HIGH}>High</SelectItem>
              <SelectItem value={TodoPriority.URGENT}>Urgent</SelectItem>
            </SelectContent>
          </Select>

          {members && members.length > 0 && (
            <Select
              onValueChange={(value) =>
                handleBatchUpdate(
                  'assignedToId',
                  value === 'unassigned' ? null : value
                )
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Assign to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassign</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    {member.name || member.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={handleBatchDeleteClick}
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Todos"
        description={`Are you sure you want to delete ${selectedIds.length} todo(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleBatchDeleteConfirm}
      />
    </div>
  );
}

