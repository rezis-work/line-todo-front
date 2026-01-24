import { api } from './client';
import type {
  Workspace,
  WorkspaceMember,
  CreateWorkspaceInput,
  AddMemberInput,
  UpdateMemberRoleInput,
  UpdateWorkspaceInput,
} from '@/types/api';

/**
 * Get all workspaces for the current user
 */
export async function getWorkspaces(): Promise<Workspace[]> {
  return api.get<Workspace[]>('/workspaces');
}

/**
 * Create a new workspace
 */
export async function createWorkspace(
  input: CreateWorkspaceInput
): Promise<Workspace> {
  return api.post<Workspace>('/workspaces', input);
}

/**
 * Get workspace details by ID
 */
export async function getWorkspace(id: string): Promise<Workspace> {
  return api.get<Workspace>(`/workspaces/${id}`);
}

/**
 * Get all members of a workspace
 * Note: Backend endpoint may need to be added if it doesn't exist
 */
export async function getWorkspaceMembers(
  id: string
): Promise<WorkspaceMember[]> {
  return api.get<WorkspaceMember[]>(`/workspaces/${id}/members`);
}

/**
 * Add a member to a workspace
 */
export async function addWorkspaceMember(
  id: string,
  input: AddMemberInput
): Promise<WorkspaceMember> {
  return api.post<WorkspaceMember>(`/workspaces/${id}/members`, input);
}

/**
 * Update a member's role in a workspace
 */
export async function updateMemberRole(
  id: string,
  userId: string,
  input: UpdateMemberRoleInput
): Promise<WorkspaceMember> {
  return api.patch<WorkspaceMember>(
    `/workspaces/${id}/members/${userId}`,
    input
  );
}

/**
 * Remove a member from a workspace
 */
export async function removeMember(
  id: string,
  userId: string
): Promise<void> {
  return api.delete<void>(`/workspaces/${id}/members/${userId}`);
}

/**
 * Update a workspace
 */
export async function updateWorkspace(
  id: string,
  input: UpdateWorkspaceInput
): Promise<Workspace> {
  return api.patch<Workspace>(`/workspaces/${id}`, input);
}

