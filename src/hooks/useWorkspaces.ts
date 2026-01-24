'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  getWorkspaces,
  createWorkspace,
  getWorkspace,
  getWorkspaceMembers,
  addWorkspaceMember,
  updateMemberRole,
  removeMember,
  updateWorkspace,
} from '@/lib/api/workspaces';
import type {
  Workspace,
  WorkspaceMember,
  CreateWorkspaceInput,
  AddMemberInput,
  UpdateMemberRoleInput,
  UpdateWorkspaceInput,
} from '@/types/api';
import { useToast } from './use-toast';
import type { ApiError } from '@/types/api';
import { isApiError } from '@/lib/api/errors';

/**
 * Query hook to get all workspaces for the current user
 */
export function useWorkspacesQuery() {
  return useQuery<Workspace[]>({
    queryKey: ['workspaces', 'list'],
    queryFn: getWorkspaces,
  });
}

/**
 * Query hook to get workspace details by ID
 */
export function useWorkspaceDetailQuery(workspaceId: string) {
  return useQuery<Workspace>({
    queryKey: ['workspaces', 'detail', workspaceId],
    queryFn: () => getWorkspace(workspaceId),
    enabled: !!workspaceId,
  });
}

/**
 * Query hook to get workspace members
 */
export function useWorkspaceMembersQuery(workspaceId: string) {
  return useQuery<WorkspaceMember[]>({
    queryKey: ['workspaces', workspaceId, 'members'],
    queryFn: () => getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

/**
 * Mutation hook for creating a workspace
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<Workspace, Error, CreateWorkspaceInput>({
    mutationFn: createWorkspace,
    onSuccess: (data) => {
      // Invalidate workspaces list
      queryClient.invalidateQueries({ queryKey: ['workspaces', 'list'] });

      // Navigate to the new workspace
      router.push(`/w/${data.id}`);

      toast({
        title: 'Success',
        description: 'Workspace created successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to create workspace';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Mutation hook for adding a member to a workspace
 */
export function useAddMember(workspaceId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<WorkspaceMember, Error, AddMemberInput>({
    mutationFn: (input) => addWorkspaceMember(workspaceId, input),
    onSuccess: () => {
      // Invalidate workspace members
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'members'],
      });

      toast({
        title: 'Success',
        description: 'Member added successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to add member';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Mutation hook for updating a member's role
 */
export function useUpdateMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    WorkspaceMember,
    Error,
    { userId: string; input: UpdateMemberRoleInput }
  >({
    mutationFn: ({ userId, input }) =>
      updateMemberRole(workspaceId, userId, input),
    onSuccess: () => {
      // Invalidate workspace members
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'members'],
      });

      toast({
        title: 'Success',
        description: 'Member role updated successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to update member role';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Mutation hook for removing a member from a workspace
 */
export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: (userId) => removeMember(workspaceId, userId),
    onSuccess: () => {
      // Invalidate workspace members
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'members'],
      });

      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to remove member';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Mutation hook for updating a workspace
 */
export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Workspace, Error, UpdateWorkspaceInput>({
    mutationFn: (input) => updateWorkspace(workspaceId, input),
    onSuccess: () => {
      // Invalidate both workspace list and detail
      queryClient.invalidateQueries({ queryKey: ['workspaces', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', 'detail', workspaceId],
      });

      toast({
        title: 'Success',
        description: 'Workspace updated successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to update workspace';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

