'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useWorkspaceDetailQuery } from '@/hooks/useWorkspaces';
import type { Workspace, WorkspaceRole } from '@/types/api';

interface WorkspaceContextValue {
  workspace: Workspace | undefined;
  role: WorkspaceRole | undefined;
  isLoading: boolean;
  isError: boolean;
  workspaceId: string | undefined;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined
);

interface WorkspaceProviderProps {
  children: ReactNode;
  workspaceId: string;
}

export function WorkspaceProvider({
  children,
  workspaceId,
}: WorkspaceProviderProps) {
  const { data: workspace, isLoading, isError } =
    useWorkspaceDetailQuery(workspaceId);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        role: workspace?.role,
        isLoading,
        isError,
        workspaceId,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useCurrentWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error(
      'useCurrentWorkspace must be used within a WorkspaceProvider'
    );
  }
  return context;
}

