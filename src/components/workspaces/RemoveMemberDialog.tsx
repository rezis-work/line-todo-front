'use client';

import { useState } from 'react';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRemoveMember } from '@/hooks/useWorkspaces';
import type { WorkspaceMember } from '@/types/api';

interface RemoveMemberDialogProps {
  workspaceId: string;
  member: WorkspaceMember;
  trigger?: React.ReactNode;
}

export function RemoveMemberDialog({
  workspaceId,
  member,
  trigger,
}: RemoveMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const removeMember = useRemoveMember(workspaceId);

  const handleRemove = () => {
    removeMember.mutate(member.userId, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            Remove
          </Button>
        )}
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Remove Member</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Are you sure you want to remove this member from the workspace?
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="py-4">
          <Alert variant="destructive">
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This will remove {member.name || member.email} from the workspace.
              This action cannot be undone.
            </AlertDescription>
          </Alert>
        </div>
        <ResponsiveDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={removeMember.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={removeMember.isPending}
          >
            {removeMember.isPending ? 'Removing...' : 'Remove Member'}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

