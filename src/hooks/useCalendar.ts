'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCalendarEvents,
  getCalendarStats,
  getCalendarEvent,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/lib/api/calendar';
import type {
  CalendarEvent,
  CalendarEventListResponse,
  CalendarStats,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  CalendarEventFilters,
  ApiError,
} from '@/types/api';
import { useToast } from './use-toast';
import { isApiError } from '@/lib/api/errors';

export function useCalendarEventsQuery(
  workspaceId: string,
  filters?: CalendarEventFilters,
  options?: { enabled?: boolean }
) {
  return useQuery<CalendarEventListResponse>({
    queryKey: ['calendar', workspaceId, filters],
    queryFn: () => getCalendarEvents(workspaceId, filters),
    enabled: !!workspaceId && (options?.enabled !== false),
  });
}

export function useCalendarStatsQuery(
  workspaceId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<CalendarStats>({
    queryKey: ['calendar', workspaceId, 'stats'],
    queryFn: () => getCalendarStats(workspaceId),
    enabled: !!workspaceId && (options?.enabled !== false),
  });
}

export function useCalendarEventDetailQuery(
  workspaceId: string,
  eventId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<CalendarEvent>({
    queryKey: ['calendar', workspaceId, 'detail', eventId],
    queryFn: () => getCalendarEvent(workspaceId, eventId),
    enabled: !!workspaceId && !!eventId && (options?.enabled !== false),
  });
}

export function useCreateCalendarEvent(workspaceId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<CalendarEvent, Error, CreateCalendarEventInput>({
    mutationFn: (input) => createCalendarEvent(workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', workspaceId] });
      toast({
        title: 'Success',
        description: 'Calendar event created successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to create calendar event';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateCalendarEvent(workspaceId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    CalendarEvent,
    Error,
    { eventId: string; input: UpdateCalendarEventInput }
  >({
    mutationFn: ({ eventId, input }) =>
      updateCalendarEvent(workspaceId, eventId, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['calendar', workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ['calendar', workspaceId, 'detail', variables.eventId],
      });
      toast({
        title: 'Success',
        description: 'Calendar event updated successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to update calendar event';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteCalendarEvent(workspaceId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: (eventId) => deleteCalendarEvent(workspaceId, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', workspaceId] });
      toast({
        title: 'Success',
        description: 'Calendar event deleted successfully',
      });
    },
    onError: (error: Error | ApiError) => {
      const message = isApiError(error)
        ? error.message
        : error.message || 'Failed to delete calendar event';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

