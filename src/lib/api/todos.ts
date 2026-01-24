import { api } from './client';
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

/**
 * Build query string from filters object
 */
function buildQueryString(filters?: TodoFilters): string {
  if (!filters) return '';

  const params = new URLSearchParams();

  if (filters.status) {
    params.append('status', filters.status);
  }
  if (filters.statuses && filters.statuses.length > 0) {
    params.append('statuses', filters.statuses.join(','));
  }
  if (filters.priority) {
    params.append('priority', filters.priority);
  }
  if (filters.priorities && filters.priorities.length > 0) {
    params.append('priorities', filters.priorities.join(','));
  }
  if (filters.assignedToId !== undefined) {
    params.append('assignedToId', filters.assignedToId);
  }
  if (filters.createdById) {
    params.append('createdById', filters.createdById);
  }
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.dueBefore) {
    params.append('dueBefore', filters.dueBefore);
  }
  if (filters.dueAfter) {
    params.append('dueAfter', filters.dueAfter);
  }
  if (filters.overdue !== undefined) {
    params.append('overdue', String(filters.overdue));
  }
  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy);
  }
  if (filters.sortOrder) {
    params.append('sortOrder', filters.sortOrder);
  }
  if (filters.page) {
    params.append('page', String(filters.page));
  }
  if (filters.limit) {
    params.append('limit', String(filters.limit));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get todos for a workspace with optional filters
 */
export async function getTodos(
  workspaceId: string,
  filters?: TodoFilters
): Promise<TodoListResponse> {
  const queryString = buildQueryString(filters);
  return api.get<TodoListResponse>(
    `/workspaces/${workspaceId}/todos${queryString}`
  );
}

/**
 * Get todo statistics for a workspace
 */
export async function getTodoStats(
  workspaceId: string
): Promise<TodoStats> {
  return api.get<TodoStats>(`/workspaces/${workspaceId}/todos/stats`);
}

/**
 * Get a single todo by ID
 */
export async function getTodo(
  workspaceId: string,
  todoId: string
): Promise<Todo> {
  return api.get<Todo>(`/workspaces/${workspaceId}/todos/${todoId}`);
}

/**
 * Create a new todo
 */
export async function createTodo(
  workspaceId: string,
  input: CreateTodoInput
): Promise<Todo> {
  return api.post<Todo>(`/workspaces/${workspaceId}/todos`, input);
}

/**
 * Update a todo
 */
export async function updateTodo(
  workspaceId: string,
  todoId: string,
  input: UpdateTodoInput
): Promise<Todo> {
  return api.patch<Todo>(
    `/workspaces/${workspaceId}/todos/${todoId}`,
    input
  );
}

/**
 * Delete a todo
 */
export async function deleteTodo(
  workspaceId: string,
  todoId: string
): Promise<void> {
  return api.delete<void>(`/workspaces/${workspaceId}/todos/${todoId}`);
}

/**
 * Batch update todos
 */
export async function batchUpdateTodos(
  workspaceId: string,
  input: BatchUpdateInput
): Promise<void> {
  return api.patch<void>(`/workspaces/${workspaceId}/todos/batch`, input);
}

/**
 * Batch delete todos
 */
export async function batchDeleteTodos(
  workspaceId: string,
  input: BatchDeleteInput
): Promise<void> {
  return api.delete<void>(`/workspaces/${workspaceId}/todos/batch`, {
    data: input,
  });
}

