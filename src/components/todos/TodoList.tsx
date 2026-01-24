'use client';

import { useState } from 'react';
import { Todo, TodoStatus } from '@/types/api';
import { TodoItem } from './TodoItem';
import { Button } from '@/components/ui/button';
import { useUpdateTodo, useDeleteTodo } from '@/hooks/useTodos';
import { Loader2 } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  isLoading?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (todoId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onEdit?: (todo: Todo) => void;
  workspaceId: string;
}

export function TodoList({
  todos,
  isLoading = false,
  selectedIds = new Set(),
  onSelect,
  onSelectAll,
  onEdit,
  workspaceId,
}: TodoListProps) {
  const updateTodo = useUpdateTodo(workspaceId);
  const deleteTodo = useDeleteTodo(workspaceId);

  const handleStatusChange = (todoId: string, status: TodoStatus) => {
    updateTodo.mutate({
      todoId,
      input: { status },
    });
  };

  const handleDelete = (todoId: string) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      deleteTodo.mutate(todoId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No todos found.</p>
      </div>
    );
  }

  const allSelected = todos.length > 0 && todos.every((todo) => selectedIds.has(todo.id));
  const someSelected = todos.some((todo) => selectedIds.has(todo.id));

  return (
    <div className="space-y-4">
      {onSelectAll && todos.length > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectAll(!allSelected)}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
          {someSelected && (
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
          )}
        </div>
      )}

      <div className="space-y-3">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            isSelected={selectedIds.has(todo.id)}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}

