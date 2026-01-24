'use client';

import { useCurrentWorkspace } from '@/hooks/useCurrentWorkspace';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarView } from '@/components/calendar/CalendarView';
import { CalendarDashboard } from '@/components/calendar/CalendarDashboard';

export default function CalendarPage() {
  const { workspace, isLoading, isError } = useCurrentWorkspace();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Workspace not found</h1>
          <p className="text-muted-foreground mb-4">
            The workspace you're looking for doesn't exist or you don't have access.
          </p>
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your workspace events and schedules
            </p>
          </div>
        </div>

        <CalendarDashboard workspaceId={workspace.id} />
        <CalendarView workspaceId={workspace.id} />
      </div>
    </div>
  );
}

