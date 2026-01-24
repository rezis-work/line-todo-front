'use client';

import { useState } from 'react';
import { useCalendarEventsQuery } from '@/hooks/useCalendar';
import { CalendarEventDialog } from './CalendarEventDialog';
import { CalendarEventCard } from './CalendarEventCard';
import { CalendarFilters } from './CalendarFilters';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import type { CalendarEventFilters, CalendarEvent } from '@/types/api';

interface CalendarViewProps {
  workspaceId: string;
}

export function CalendarView({ workspaceId }: CalendarViewProps) {
  const [filters, setFilters] = useState<CalendarEventFilters>({
    sortBy: 'startAt',
    sortOrder: 'asc',
    page: 1,
    limit: 50,
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const { data, isLoading } = useCalendarEventsQuery(workspaceId, filters);

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setCreateDialogOpen(true);
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Events</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <CalendarFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data && data.events.length > 0 ? (
        <div className="space-y-3">
          {data.events.map((event) => (
            <CalendarEventCard
              key={event.id}
              event={event}
              workspaceId={workspaceId}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No events found.</p>
        </div>
      )}

      <CalendarEventDialog
        workspaceId={workspaceId}
        event={editingEvent}
        open={createDialogOpen || !!editingEvent}
        onOpenChange={handleDialogClose}
      />
    </div>
  );
}

