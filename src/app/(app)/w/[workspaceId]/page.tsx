'use client';

import { useCurrentWorkspace } from '@/hooks/useCurrentWorkspace';
import { WorkspaceRole } from '@/types/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export default function WorkspaceDashboardPage() {
  const { workspace, role, isLoading, isError } = useCurrentWorkspace();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground">Loading workspace...</p>
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
            The workspace you're looking for doesn't exist or you don't have access to it.
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
            <h1 className="text-3xl font-bold tracking-tight">
              {workspace.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Welcome to your workspace dashboard
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/w/${workspace.id}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Workspace Info</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Your Role
                </label>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {role}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="mt-1 text-sm">
                  {new Date(workspace.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={`/w/${workspace.id}/settings`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Todos</h2>
          <p className="text-sm text-muted-foreground">
            Todo lists will appear here. This feature is coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}

