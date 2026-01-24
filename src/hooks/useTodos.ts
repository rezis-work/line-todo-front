'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTodos,
  getTodoStats,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  batchUpdateTodos,
  batchDeleteTodos,
} from '@/lib/api/todos';
import type {
  Todo,
  TodoListResponse,
  TodoStats,
  CreateTodoInput,
  UpdateTodoInput,
  TodoFilters,
  BatchUpdateInput,
  BatchDeleteInput,
} from '@/types/api';
import { useToast } from './use-toast';
import type { ApiError } from '@/types/api';
import { isApiError } from '@/lib/api/errors';

/**
 * Query hook to get todos for a workspace with filters
 */
export function useTodosQuery(
  workspaceId: string,
  filters?: TodoFilters,
  options?: { enabled?: boolean }
) {
  return useQuery<TodoListResponse>({
    queryKey: ['todos', workspaceId, filters],
    queryFn: () => getTodos(workspaceId, filters),
    enabled: !!workspaceId && (options?.enabled !== false),
  });
}

/**
 * Query hook to get todo statistics for a workspace
 */
export function useTodoStatsQuery(
  workspaceId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<TodoStats>({
    queryKey: ['todos', workspaceId, 'stats'],
    queryFn: () => getTodoStats(workspaceId),
    enabled: !!workspaceId && (options?.enabled !== false),
  });
}

/**
 * Query hook to get a single todo by ID
 */
export function useTodoDetailQuery(
  workspaceId: string,
  todoId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<Todo>({
    queryKey: ['todos', workspaceId, 'detail', todoId],
    queryFn: () => getTodo(workspaceId, todoId),
    enabled: !!workspaceId && !!todoId && (options?.enabled !== false),
  });
}

/**
 * Mutation hook for creating a todo
 */
export function useCreateTodo(workspaceId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Todo, Error, CreateTodoInput>({
    mutationFn: (input) => createTodo(workspaceId, input),
    onSuccess: () => {
      // Invalidate todos list and stats
      queryClient.invalidateQueries({ queryKey: ['todos', workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ['todos', workspaceId, 'stats'],
      });

      toast({
        title: 'Success',
        description: 'Todo created successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to create todo';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Mutation hook for updating a todo
 */
export function useUpdateTodo(workspaceId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    Todo,
    Error,
    { todoId: string; input: UpdateTodoInput }
  >({
    mutationFn: ({ todoId, input }) => updateTodo(workspaceId, todoId, input),
    onSuccess: (data, variables) => {
      // Invalidate todos list, stats, and specific todo detail
      queryClient.invalidateQueries({ queryKey: ['todos', workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ['todos', workspaceId, 'stats'],
      });
      queryClient.invalidateQueries({
        queryKey: ['todos', workspaceId, 'detail', variables.todoId],
      });

      toast({
        title: 'Success',
        description: 'Todo updated successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to update todo';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Mutation hook for deleting a todo
 */
export function useDeleteTodo(workspaceId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: (todoId) => deleteTodo(workspaceId, todoId),
    onSuccess: () => {
      // Invalidate todos list and stats
      queryClient.invalidateQueries({ queryKey: ['todos', workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ['todos', workspaceId, 'stats'],
      });

      toast({
        title: 'Success',
        description: 'Todo deleted successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to delete todo';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Mutation hook for batch updating todos
 */
export function useBatchUpdateTodos(workspaceId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, BatchUpdateInput>({
    mutationFn: (input) => batchUpdateTodos(workspaceId, input),
    onSuccess: () => {
      // Invalidate todos list and stats
      queryClient.invalidateQueries({ queryKey: ['todos', workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ['todos', workspaceId, 'stats'],
      });

      toast({
        title: 'Success',
        description: 'Todos updated successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to update todos';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Mutation hook for batch deleting todos
 */
export function useBatchDeleteTodos(workspaceId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, BatchDeleteInput>({
    mutationFn: (input) => batchDeleteTodos(workspaceId, input),
    onSuccess: () => {
      // Invalidate todos list and stats
      queryClient.invalidateQueries({ queryKey: ['todos', workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ['todos', workspaceId, 'stats'],
      });

      toast({
        title: 'Success',
        description: 'Todos deleted successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to delete todos';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

