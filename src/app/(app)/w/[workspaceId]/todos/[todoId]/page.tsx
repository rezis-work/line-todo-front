'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCurrentWorkspace } from '@/hooks/useCurrentWorkspace';
import { useTodoDetailQuery } from '@/hooks/useTodos';
import { TodoDialog } from '@/components/todos/TodoDialog';
import { TaskChatPanel } from '@/components/ai/TaskChatPanel';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TodoStatus, TodoPriority } from '@/types/api';
import { useDeleteTodo } from '@/hooks/useTodos';
import { useRouter } from 'next/navigation';

export default function TodoDetailPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const todoId = params.todoId as string;
  const router = useRouter();
  const { workspace, isLoading: workspaceLoading } = useCurrentWorkspace();
  const { data: todo, isLoading: todoLoading } = useTodoDetailQuery(
    workspaceId,
    todoId
  );
  const deleteTodo = useDeleteTodo(workspaceId);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteTodo.mutate(todoId, {
      onSuccess: () => {
        router.push(`/w/${workspaceId}/todos`);
      },
    });
  };

  if (workspaceLoading || todoLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">Loading todo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!workspace || !todo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Todo not found</h1>
          <p className="text-muted-foreground mb-4">
            The todo you're looking for doesn't exist or you don't have access to
            it.
          </p>
          <Button asChild>
            <Link href={`/w/${workspaceId}/todos`}>Back to Todos</Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusColors: Record<TodoStatus, string> = {
    [TodoStatus.TODO]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    [TodoStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [TodoStatus.DONE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [TodoStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const priorityColors: Record<TodoPriority, string> = {
    [TodoPriority.LOW]: 'text-green-600',
    [TodoPriority.MEDIUM]: 'text-yellow-600',
    [TodoPriority.HIGH]: 'text-orange-600',
    [TodoPriority.URGENT]: 'text-red-600',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/w/${workspaceId}/todos`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">{todo.title}</CardTitle>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColors[todo.status]}`}
                  >
                    {todo.status.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-sm font-medium ${priorityColors[todo.priority]}`}
                  >
                    Priority: {todo.priority}
                  </span>
                  {todo.isOverdue && (
                    <span className="text-sm font-semibold text-destructive">
                      Overdue
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <TodoDialog
                  workspaceId={workspaceId}
                  todo={todo}
                  open={editDialogOpen}
                  onOpenChange={setEditDialogOpen}
                  trigger={<Button variant="outline">Edit</Button>}
                />
                <TaskChatPanel todoId={todoId} />
                <Button variant="destructive" onClick={handleDeleteClick}>
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {todo.description && (
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {todo.description}
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {todo.dueAt && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Due Date</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(todo.dueAt).toLocaleString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium mb-1">Created</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(todo.createdAt).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Creator</h3>
                <p className="text-sm text-muted-foreground">
                  {todo.creator.name || todo.creator.email}
                </p>
              </div>

              {todo.assignee && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Assigned To</h3>
                  <p className="text-sm text-muted-foreground">
                    {todo.assignee.name || todo.assignee.email}
                  </p>
                </div>
              )}

              {todo._count && todo._count.comments > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Comments</h3>
                  <p className="text-sm text-muted-foreground">
                    {todo._count.comments} comment
                    {todo._count.comments !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Todo"
          description="Are you sure you want to delete this todo? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
}

