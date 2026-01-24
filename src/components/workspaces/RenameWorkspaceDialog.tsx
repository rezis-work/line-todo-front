'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateWorkspace } from '@/hooks/useWorkspaces';
import { useCurrentWorkspace } from '@/hooks/useCurrentWorkspace';

const renameWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Workspace name is required')
    .max(100, 'Workspace name must be 100 characters or less'),
});

type RenameWorkspaceFormValues = z.infer<typeof renameWorkspaceSchema>;

interface RenameWorkspaceDialogProps {
  trigger?: React.ReactNode;
}

export function RenameWorkspaceDialog({
  trigger,
}: RenameWorkspaceDialogProps) {
  const [open, setOpen] = useState(false);
  const { workspace, workspaceId } = useCurrentWorkspace();
  const updateWorkspace = useUpdateWorkspace(workspaceId || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RenameWorkspaceFormValues>({
    resolver: zodResolver(renameWorkspaceSchema),
    defaultValues: {
      name: workspace?.name || '',
    },
  });

  // Reset form when dialog opens or workspace changes
  useEffect(() => {
    if (open && workspace?.name) {
      reset({ name: workspace.name });
    }
  }, [open, workspace?.name, reset]);

  const onSubmit = (data: RenameWorkspaceFormValues) => {
    if (!workspaceId) return;

    updateWorkspace.mutate(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        {trigger || <Button variant="outline">Edit</Button>}
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Rename Workspace</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Update the name of your workspace. This will be visible to all
              members.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                placeholder="My Workspace"
                {...register('name')}
                disabled={updateWorkspace.isPending}
                defaultValue={workspace?.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
          </div>
          <ResponsiveDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateWorkspace.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateWorkspace.isPending}>
              {updateWorkspace.isPending ? 'Updating...' : 'Update'}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

