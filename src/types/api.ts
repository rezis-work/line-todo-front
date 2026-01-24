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

