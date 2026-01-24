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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateMemberRole } from '@/hooks/useWorkspaces';
import { WorkspaceRole, type WorkspaceMember } from '@/types/api';

interface UpdateRoleDialogProps {
  workspaceId: string;
  member: WorkspaceMember;
  trigger?: React.ReactNode;
}

export function UpdateRoleDialog({
  workspaceId,
  member,
  trigger,
}: UpdateRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<WorkspaceRole>(member.role);
  const updateRole = useUpdateMemberRole(workspaceId);

  const handleSubmit = () => {
    updateRole.mutate(
      { userId: member.userId, input: { role } },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm">Change Role</Button>}
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Update Member Role</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Change the role for {member.name || member.email}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as WorkspaceRole)}
              disabled={updateRole.isPending}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={WorkspaceRole.MEMBER}>Member</SelectItem>
                <SelectItem value={WorkspaceRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={WorkspaceRole.OWNER}>Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <ResponsiveDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={updateRole.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateRole.isPending}>
            {updateRole.isPending ? 'Updating...' : 'Update Role'}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

