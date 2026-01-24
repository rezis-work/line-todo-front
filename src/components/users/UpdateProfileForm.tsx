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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUpdateProfile } from '@/hooks/useUser';
import type { UserProfileResponse } from '@/types/api';

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 character')
    .max(100, 'Name must be 100 characters or less')
    .trim()
    .optional()
    .or(z.literal('')),
});

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

interface UpdateProfileFormProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  user?: UserProfileResponse | null;
}

export function UpdateProfileForm({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  user,
}: UpdateProfileFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const updateProfile = useUpdateProfile();

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen =
    controlledOnOpenChange !== undefined
      ? controlledOnOpenChange
      : setInternalOpen;

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
      });
    }
  }, [user, form]);

  const onSubmit = (data: UpdateProfileFormValues) => {
    updateProfile.mutate(
      {
        name: data.name || undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      }
    );
  };

  const isLoading = updateProfile.isPending;

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        {trigger || <Button variant="outline">Edit Profile</Button>}
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>Edit Profile</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Update your display name. This will be visible to other workspace
                members.
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <ResponsiveDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update'}
              </Button>
            </ResponsiveDialogFooter>
          </form>
        </Form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

