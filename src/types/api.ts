export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshInput {
  refreshToken: string;
}

export interface LogoutInput {
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  data: T;
  requestId?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  requestId?: string;
  code?: string;
  details?: unknown;
}

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  role: WorkspaceRole;
}

export interface WorkspaceMember {
  userId: string;
  email: string;
  name: string | null;
  role: WorkspaceRole;
  createdAt: string;
}

export interface CreateWorkspaceInput {
  name: string;
}

export interface AddMemberInput {
  email: string;
  role: WorkspaceRole;
}

export interface UpdateMemberRoleInput {
  role: WorkspaceRole;
}

export interface UpdateWorkspaceInput {
  name: string;
}

// Todo Types
export enum TodoStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum TodoPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Todo {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  dueAt: string | null;
  createdById: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  creator: {
    id: string;
    email: string;
    name: string | null;
  };
  assignee: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  _count?: {
    comments: number;
  };
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueAt?: string;
  assignedToId?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueAt?: string | null;
  assignedToId?: string | null;
}

export interface TodoFilters {
  status?: TodoStatus;
  statuses?: TodoStatus[];
  priority?: TodoPriority;
  priorities?: TodoPriority[];
  assignedToId?: string; // Use "unassigned" for null
  createdById?: string;
  search?: string;
  dueBefore?: string;
  dueAfter?: string;
  overdue?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueAt' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TodoListResponse {
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BatchUpdateInput {
  todoIds: string[];
  status?: TodoStatus;
  priority?: TodoPriority;
  assignedToId?: string | null;
}

export interface BatchDeleteInput {
  todoIds: string[];
}

export interface TodoStats {
  total: number;
  byStatus: Record<TodoStatus, number>;
  byPriority: Record<TodoPriority, number>;
  overdue: number;
  unassigned: number;
  dueToday: number;
  dueThisWeek: number;
}

