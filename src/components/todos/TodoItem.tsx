'use client';

import { Todo, TodoStatus, TodoPriority } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
// Using native Date formatting instead of date-fns
import { Edit, Trash2 } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  isSelected?: boolean;
  onSelect?: (todoId: string, selected: boolean) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (todoId: string) => void;
  onStatusChange?: (todoId: string, status: TodoStatus) => void;
}

const statusColors: Record<TodoStatus, string> = {
  [TodoStatus.TODO]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  [TodoStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [TodoStatus.DONE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [TodoStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const priorityColors: Record<TodoPriority, string> = {
  [TodoPriority.LOW]: 'border-l-green-500',
  [TodoPriority.MEDIUM]: 'border-l-yellow-500',
  [TodoPriority.HIGH]: 'border-l-orange-500',
  [TodoPriority.URGENT]: 'border-l-red-500',
};

export function TodoItem({
  todo,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
}: TodoItemProps) {
  const isOverdue = todo.isOverdue && todo.status !== TodoStatus.DONE;

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-colors',
        priorityColors[todo.priority],
        isSelected && 'bg-muted',
        isOverdue && 'border-l-red-600 border-l-4'
      )}
    >
      <div className="flex items-start gap-3">
        {onSelect && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              onSelect?.(todo.id, checked === true)
            }
            className="mt-1"
          />
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={cn(
                  'font-semibold',
                  todo.status === TodoStatus.DONE && 'line-through text-muted-foreground'
                )}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {todo.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(todo)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(todo.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                statusColors[todo.status]
              )}
            >
              {todo.status.replace('_', ' ')}
            </span>
            {todo.dueAt && (
              <span
                className={cn(
                  'text-muted-foreground',
                  isOverdue && 'font-semibold text-destructive'
                )}
              >
                Due:{' '}
                {new Date(todo.dueAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
            {todo.assignee && (
              <span className="text-muted-foreground">
                Assigned to: {todo.assignee.name || todo.assignee.email}
              </span>
            )}
            {todo._count && todo._count.comments > 0 && (
              <span className="text-muted-foreground">
                {todo._count.comments} comment{todo._count.comments !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {onStatusChange && todo.status !== TodoStatus.DONE && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(todo.id, TodoStatus.IN_PROGRESS)}
                disabled={todo.status === TodoStatus.IN_PROGRESS}
              >
                Start
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(todo.id, TodoStatus.DONE)}
              >
                Complete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

