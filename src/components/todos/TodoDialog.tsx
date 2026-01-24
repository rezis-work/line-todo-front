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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateTodo, useUpdateTodo } from '@/hooks/useTodos';
import { TodoStatus, TodoPriority, type Todo } from '@/types/api';
import { useWorkspaceMembersQuery } from '@/hooks/useWorkspaces';

const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  description: z
    .string()
    .max(5000, 'Description must be 5000 characters or less')
    .optional(),
  status: z.nativeEnum(TodoStatus).optional(),
  priority: z.nativeEnum(TodoPriority).optional(),
  dueAt: z.string().optional(),
  assignedToId: z.string().optional(),
});

const updateTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title must be at least 1 character')
    .max(200, 'Title must be 200 characters or less')
    .trim()
    .optional(),
  description: z
    .string()
    .max(5000, 'Description must be 5000 characters or less')
    .nullable()
    .optional(),
  status: z.nativeEnum(TodoStatus).optional(),
  priority: z.nativeEnum(TodoPriority).optional(),
  dueAt: z.string().nullable().optional(),
  assignedToId: z.string().nullable().optional(),
});

type CreateTodoFormValues = z.infer<typeof createTodoSchema>;
type UpdateTodoFormValues = z.infer<typeof updateTodoSchema>;

interface TodoDialogProps {
  workspaceId: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  todo?: Todo | null;
}

export function TodoDialog({
  workspaceId,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  todo,
}: TodoDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const createTodo = useCreateTodo(workspaceId);
  const updateTodo = useUpdateTodo(workspaceId);
  const { data: members } = useWorkspaceMembersQuery(workspaceId);

  const isEditMode = !!todo;

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen =
    controlledOnOpenChange !== undefined
      ? controlledOnOpenChange
      : setInternalOpen;

  const form = useForm<CreateTodoFormValues | UpdateTodoFormValues>({
    resolver: zodResolver(isEditMode ? updateTodoSchema : createTodoSchema),
    defaultValues: isEditMode
      ? {
          title: todo.title,
          description: todo.description || '',
          status: todo.status,
          priority: todo.priority,
          dueAt: todo.dueAt
            ? new Date(todo.dueAt).toISOString().slice(0, 16)
            : '',
          assignedToId: todo.assignedToId || '',
        }
      : {
          title: '',
          description: '',
          status: TodoStatus.TODO,
          priority: TodoPriority.MEDIUM,
          dueAt: '',
          assignedToId: '',
        },
  });

  // Reset form when todo changes
  useEffect(() => {
    if (isEditMode && todo) {
      form.reset({
        title: todo.title,
        description: todo.description || '',
        status: todo.status,
        priority: todo.priority,
        dueAt: todo.dueAt
          ? new Date(todo.dueAt).toISOString().slice(0, 16)
          : '',
        assignedToId: todo.assignedToId || '',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        status: TodoStatus.TODO,
        priority: TodoPriority.MEDIUM,
        dueAt: '',
        assignedToId: '',
      });
    }
  }, [todo, isEditMode, form]);

  const onSubmit = (data: CreateTodoFormValues | UpdateTodoFormValues) => {
    if (isEditMode && todo) {
      updateTodo.mutate(
        {
          todoId: todo.id,
          input: {
            title: data.title,
            description: data.description || null,
            status: data.status,
            priority: data.priority,
            dueAt: data.dueAt ? new Date(data.dueAt).toISOString() : null,
            assignedToId: data.assignedToId || null,
          },
        },
        {
          onSuccess: () => {
            form.reset();
            setOpen(false);
          },
        }
      );
    } else {
      createTodo.mutate(
        {
          title: data.title!,
          description: data.description,
          status: data.status,
          priority: data.priority,
          dueAt: data.dueAt ? new Date(data.dueAt).toISOString() : undefined,
          assignedToId: data.assignedToId,
        },
        {
          onSuccess: () => {
            form.reset();
            setOpen(false);
          },
        }
      );
    }
  };

  const isLoading = createTodo.isPending || updateTodo.isPending;

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        {trigger || (
          <Button>{isEditMode ? 'Edit Todo' : 'Create Todo'}</Button>
        )}
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>
                {isEditMode ? 'Edit Todo' : 'Create Todo'}
              </ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                {isEditMode
                  ? 'Update the todo details below.'
                  : 'Create a new todo item for your workspace.'}
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter todo title"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter description (optional)"
                        {...field}
                        value={field.value || ''}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TodoStatus.TODO}>Todo</SelectItem>
                          <SelectItem value={TodoStatus.IN_PROGRESS}>
                            In Progress
                          </SelectItem>
                          <SelectItem value={TodoStatus.DONE}>Done</SelectItem>
                          <SelectItem value={TodoStatus.CANCELLED}>
                            Cancelled
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TodoPriority.LOW}>Low</SelectItem>
                          <SelectItem value={TodoPriority.MEDIUM}>
                            Medium
                          </SelectItem>
                          <SelectItem value={TodoPriority.HIGH}>High</SelectItem>
                          <SelectItem value={TodoPriority.URGENT}>
                            Urgent
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dueAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={field.value || ''}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedToId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === 'unassigned' ? '' : value)
                        }
                        value={field.value || 'unassigned'}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {members?.map((member) => (
                            <SelectItem key={member.userId} value={member.userId}>
                              {member.name || member.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                {isLoading
                  ? isEditMode
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditMode
                    ? 'Update'
                    : 'Create'}
              </Button>
            </ResponsiveDialogFooter>
          </form>
        </Form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

