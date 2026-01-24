'use client';

import { CalendarEvent } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteCalendarEvent } from '@/hooks/useCalendar';
import { Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarEventDialog } from './CalendarEventDialog';
import { useState } from 'react';

interface CalendarEventCardProps {
  event: CalendarEvent;
  workspaceId: string;
  onEdit?: (event: CalendarEvent) => void;
}

export function CalendarEventCard({
  event,
  workspaceId,
  onEdit,
}: CalendarEventCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteEvent = useDeleteCalendarEvent(workspaceId);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteEvent.mutate(event.id);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(event);
    }
    setEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(event.startAt)}</span>
                </div>
                <span>-</span>
                <span>{formatDate(event.endAt)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {event.relatedTodo && (
            <span className="mt-2 inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              Linked to: {event.relatedTodo.title}
            </span>
          )}
        </CardContent>
      </Card>

      <CalendarEventDialog
        workspaceId={workspaceId}
        event={event}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

