import { api } from './client';
import type {
  CalendarEvent,
  CalendarEventListResponse,
  CalendarStats,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  CalendarEventFilters,
} from '@/types/api';

function buildQueryString(filters?: CalendarEventFilters): string {
  if (!filters) return '';

  const params = new URLSearchParams();

  if (filters.startAfter) params.append('startAfter', filters.startAfter);
  if (filters.startBefore) params.append('startBefore', filters.startBefore);
  if (filters.endAfter) params.append('endAfter', filters.endAfter);
  if (filters.endBefore) params.append('endBefore', filters.endBefore);
  if (filters.relatedTodoId) params.append('relatedTodoId', filters.relatedTodoId);
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export async function getCalendarEvents(
  workspaceId: string,
  filters?: CalendarEventFilters
): Promise<CalendarEventListResponse> {
  const queryString = buildQueryString(filters);
  return api.get<CalendarEventListResponse>(
    `/workspaces/${workspaceId}/calendar${queryString}`
  );
}

export async function getCalendarStats(
  workspaceId: string
): Promise<CalendarStats> {
  return api.get<CalendarStats>(`/workspaces/${workspaceId}/calendar/stats`);
}

export async function getCalendarEvent(
  workspaceId: string,
  eventId: string
): Promise<CalendarEvent> {
  return api.get<CalendarEvent>(`/workspaces/${workspaceId}/calendar/${eventId}`);
}

export async function createCalendarEvent(
  workspaceId: string,
  input: CreateCalendarEventInput
): Promise<CalendarEvent> {
  return api.post<CalendarEvent>(`/workspaces/${workspaceId}/calendar`, input);
}

export async function updateCalendarEvent(
  workspaceId: string,
  eventId: string,
  input: UpdateCalendarEventInput
): Promise<CalendarEvent> {
  return api.patch<CalendarEvent>(
    `/workspaces/${workspaceId}/calendar/${eventId}`,
    input
  );
}

export async function deleteCalendarEvent(
  workspaceId: string,
  eventId: string
): Promise<void> {
  return api.delete<void>(`/workspaces/${workspaceId}/calendar/${eventId}`);
}

