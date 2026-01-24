'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWorkspacesQuery } from '@/hooks/useWorkspaces';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select';
import { useContext } from 'react';
import { WorkspaceContext } from '@/contexts/WorkspaceContext';
import { CreateWorkspaceDialog } from './CreateWorkspaceDialog';
import { Button } from '@/components/ui/button';

export function WorkspaceSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: workspaces, isLoading } = useWorkspacesQuery();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectValue, setSelectValue] = useState<string | undefined>();
  
  // Try to get current workspace from context (if in workspace route)
  // Note: WorkspaceSwitcher is used in the main layout, so context may not be available
  const context = useContext(WorkspaceContext);
  let currentWorkspaceId: string | undefined = context?.workspaceId;
  
  // If not from context, extract from pathname
  if (!currentWorkspaceId) {
    const match = pathname.match(/^\/w\/([^/]+)/);
    currentWorkspaceId = match ? match[1] : undefined;
  }

  // Sync selectValue with currentWorkspaceId
  useEffect(() => {
    setSelectValue(currentWorkspaceId);
  }, [currentWorkspaceId]);

  // Extract relative path after /w/[workspaceId] to preserve navigation context
  const getRelativePath = () => {
    const match = pathname.match(/^\/w\/[^/]+(\/.*)?$/);
    return match && match[1] ? match[1] : '';
  };

  const handleWorkspaceChange = (value: string) => {
    if (value === '__create__') {
      setCreateDialogOpen(true);
      // Reset select to current workspace
      setSelectValue(currentWorkspaceId);
      return;
    }

    // Preserve relative path when switching workspaces
    const relativePath = getRelativePath();
    setSelectValue(value);
    router.push(`/w/${value}${relativePath}`);
  };

  if (isLoading || !workspaces || workspaces.length === 0) {
    return (
      <>
        <CreateWorkspaceDialog
          trigger={<Button variant="outline" size="sm">Create Workspace</Button>}
        />
      </>
    );
  }

  return (
    <>
      <Select
        value={selectValue}
        onValueChange={handleWorkspaceChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select workspace" />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              {workspace.name}
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value="__create__" className="text-primary font-medium">
            + Create Workspace
          </SelectItem>
        </SelectContent>
      </Select>
      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}

