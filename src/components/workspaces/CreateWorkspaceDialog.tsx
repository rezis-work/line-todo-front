'use client';

import { useState } from 'react';
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
import { useCreateWorkspace } from '@/hooks/useWorkspaces';

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100, 'Workspace name must be 100 characters or less'),
});

type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>;

interface CreateWorkspaceDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateWorkspaceDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateWorkspaceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const createWorkspace = useCreateWorkspace();

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen =
    controlledOnOpenChange !== undefined
      ? controlledOnOpenChange
      : setInternalOpen;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  const onSubmit = (data: CreateWorkspaceFormValues) => {
    createWorkspace.mutate(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        {trigger || <Button>Create Workspace</Button>}
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Create Workspace</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Create a new workspace to organize your tasks and collaborate with
              your team.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                placeholder="My Workspace"
                {...register('name')}
                disabled={createWorkspace.isPending}
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
              disabled={createWorkspace.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createWorkspace.isPending}>
              {createWorkspace.isPending ? 'Creating...' : 'Create'}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

