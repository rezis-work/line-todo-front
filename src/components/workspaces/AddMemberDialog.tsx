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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddMember } from '@/hooks/useWorkspaces';
import { WorkspaceRole } from '@/types/api';

const addMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(WorkspaceRole, {
    errorMap: () => ({ message: 'Role must be OWNER, ADMIN, or MEMBER' }),
  }),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

interface AddMemberDialogProps {
  workspaceId: string;
  trigger?: React.ReactNode;
}

export function AddMemberDialog({
  workspaceId,
  trigger,
}: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const addMember = useAddMember(workspaceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      role: WorkspaceRole.MEMBER,
    },
  });

  const role = watch('role');

  const onSubmit = (data: AddMemberFormValues) => {
    addMember.mutate(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        {trigger || <Button>Add Member</Button>}
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Add Member</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Invite a user to join this workspace by their email address.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                {...register('email')}
                disabled={addMember.isPending}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) =>
                  setValue('role', value as WorkspaceRole)
                }
                disabled={addMember.isPending}
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
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>
          </div>
          <ResponsiveDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={addMember.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addMember.isPending}>
              {addMember.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

