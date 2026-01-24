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
import { useCreateCalendarEvent, useUpdateCalendarEvent } from '@/hooks/useCalendar';
import type { CalendarEvent } from '@/types/api';
import { useTodosQuery } from '@/hooks/useTodos';

const createCalendarEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  startAt: z.string().min(1, 'Start date is required'),
  endAt: z.string().min(1, 'End date is required'),
  relatedTodoId: z.string().optional(),
}).refine(
  (data) => {
    if (data.startAt && data.endAt) {
      return new Date(data.endAt) >= new Date(data.startAt);
    }
    return true;
  },
  { message: 'End date must be after or equal to start date', path: ['endAt'] }
);

const updateCalendarEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Title must be at least 1 character')
    .max(200, 'Title must be 200 characters or less')
    .trim()
    .optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  relatedTodoId: z.string().nullable().optional(),
}).refine(
  (data) => {
    if (data.startAt && data.endAt) {
      return new Date(data.endAt) >= new Date(data.startAt);
    }
    return true;
  },
  { message: 'End date must be after or equal to start date', path: ['endAt'] }
);

type CreateCalendarEventFormValues = z.infer<typeof createCalendarEventSchema>;
type UpdateCalendarEventFormValues = z.infer<typeof updateCalendarEventSchema>;

interface CalendarEventDialogProps {
  workspaceId: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  event?: CalendarEvent | null;
}

export function CalendarEventDialog({
  workspaceId,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  event,
}: CalendarEventDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const createEvent = useCreateCalendarEvent(workspaceId);
  const updateEvent = useUpdateCalendarEvent(workspaceId);
  const { data: todosData } = useTodosQuery(workspaceId, { limit: 100 });

  const isEditMode = !!event;

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen =
    controlledOnOpenChange !== undefined
      ? controlledOnOpenChange
      : setInternalOpen;

  const formatDateTimeForInput = (dateString: string) => {
    return new Date(dateString).toISOString().slice(0, 16);
  };

  const form = useForm<CreateCalendarEventFormValues | UpdateCalendarEventFormValues>({
    resolver: zodResolver(isEditMode ? updateCalendarEventSchema : createCalendarEventSchema),
    defaultValues: isEditMode
      ? {
          title: event.title,
          startAt: formatDateTimeForInput(event.startAt),
          endAt: formatDateTimeForInput(event.endAt),
          relatedTodoId: event.relatedTodoId || '',
        }
      : {
          title: '',
          startAt: '',
          endAt: '',
          relatedTodoId: '',
        },
  });

  useEffect(() => {
    if (isEditMode && event) {
      form.reset({
        title: event.title,
        startAt: formatDateTimeForInput(event.startAt),
        endAt: formatDateTimeForInput(event.endAt),
        relatedTodoId: event.relatedTodoId || '',
      });
    } else {
      form.reset({
        title: '',
        startAt: '',
        endAt: '',
        relatedTodoId: '',
      });
    }
  }, [event, isEditMode, form]);

  const onSubmit = (data: CreateCalendarEventFormValues | UpdateCalendarEventFormValues) => {
    const submitData = {
      title: data.title,
      startAt: data.startAt ? new Date(data.startAt).toISOString() : undefined,
      endAt: data.endAt ? new Date(data.endAt).toISOString() : undefined,
      relatedTodoId: data.relatedTodoId || undefined,
    };

    if (isEditMode && event) {
      updateEvent.mutate(
        {
          eventId: event.id,
          input: submitData,
        },
        {
          onSuccess: () => {
            setOpen(false);
          },
        }
      );
    } else {
      createEvent.mutate(submitData as CreateCalendarEventFormValues, {
        onSuccess: () => {
          setOpen(false);
        },
      });
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      {trigger && <ResponsiveDialogTrigger asChild>{trigger}</ResponsiveDialogTrigger>}
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {isEditMode ? 'Edit Event' : 'Create Event'}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {isEditMode
              ? 'Update the calendar event details.'
              : 'Create a new calendar event for your workspace.'}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Event title"
                      {...field}
                      disabled={createEvent.isPending || updateEvent.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      disabled={createEvent.isPending || updateEvent.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      disabled={createEvent.isPending || updateEvent.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relatedTodoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to Todo (Optional)</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || 'none'}
                      onValueChange={(value) =>
                        field.onChange(value === 'none' ? '' : value)
                      }
                      disabled={createEvent.isPending || updateEvent.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a todo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {todosData?.todos.map((todo) => (
                          <SelectItem key={todo.id} value={todo.id}>
                            {todo.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ResponsiveDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createEvent.isPending || updateEvent.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEvent.isPending || updateEvent.isPending}
              >
                {createEvent.isPending || updateEvent.isPending
                  ? 'Saving...'
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

