'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCurrentWorkspace } from '@/hooks/useCurrentWorkspace';
import { useTodosQuery } from '@/hooks/useTodos';
import { TodoFilters, Todo } from '@/types/api';
import { TodoList } from '@/components/todos/TodoList';
import { TodoFilters as TodoFiltersComponent } from '@/components/todos/TodoFilters';
import { TodoDialog } from '@/components/todos/TodoDialog';
import { BatchActionsBar } from '@/components/todos/BatchActionsBar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useWorkspaceMembersQuery } from '@/hooks/useWorkspaces';

export default function TodosPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { workspace, isLoading: workspaceLoading } = useCurrentWorkspace();
  const { data: members } = useWorkspaceMembersQuery(workspaceId);

  const [filters, setFilters] = useState<TodoFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: todosData, isLoading } = useTodosQuery(workspaceId, filters);

  const handleSelect = (todoId: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(todoId);
    } else {
      newSelected.delete(todoId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(todosData?.todos.map((t) => t.id) || []));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTodo(null);
  };

  const handleResetFilters = () => {
    setFilters({
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
    });
  };

  if (workspaceLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground">Loading workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
            <p className="mt-2 text-muted-foreground">
              Manage todos for {workspace.name}
            </p>
          </div>
          <TodoDialog
            workspaceId={workspaceId}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Todo
              </Button>
            }
            open={dialogOpen && !editingTodo}
            onOpenChange={(open) => {
              if (!open && !editingTodo) {
                setDialogOpen(false);
              } else if (open && !editingTodo) {
                setDialogOpen(true);
              }
            }}
          />
          {editingTodo && (
            <TodoDialog
              workspaceId={workspaceId}
              todo={editingTodo}
              open={dialogOpen && !!editingTodo}
              onOpenChange={(open) => {
                if (!open) {
                  handleDialogClose();
                } else {
                  setDialogOpen(true);
                }
              }}
            />
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <TodoFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              onReset={handleResetFilters}
            />
          </div>

          <div className="lg:col-span-3">
            <TodoList
              todos={todosData?.todos || []}
              isLoading={isLoading}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onEdit={handleEdit}
              workspaceId={workspaceId}
            />

            {todosData && todosData.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {todosData.page} of {todosData.totalPages} (
                  {todosData.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters({ ...filters, page: (filters.page || 1) - 1 })
                    }
                    disabled={!todosData.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters({ ...filters, page: (filters.page || 1) + 1 })
                    }
                    disabled={!todosData.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BatchActionsBar
        workspaceId={workspaceId}
        selectedIds={Array.from(selectedIds)}
        onClearSelection={() => setSelectedIds(new Set())}
        members={members}
      />
    </div>
  );
}

