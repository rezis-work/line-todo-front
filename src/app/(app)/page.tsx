'use client';

import { useMeQuery } from '@/hooks/useAuth';
import { useWorkspacesQuery } from '@/hooks/useWorkspaces';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CreateWorkspaceDialog } from '@/components/workspaces/CreateWorkspaceDialog';

export default function HomePage() {
  const { data: user } = useMeQuery();
  const { data: workspaces, isLoading } = useWorkspacesQuery();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome</h1>
          <p className="mt-2 text-muted-foreground">
            {user
              ? `Hello, ${user.name || user.email}!`
              : 'This is the authenticated shell'}
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading workspaces...</p>
        ) : workspaces && workspaces.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Workspaces</h2>
              <CreateWorkspaceDialog />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((workspace) => (
                <Link
                  key={workspace.id}
                  href={`/w/${workspace.id}`}
                  className="rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <h3 className="font-semibold">{workspace.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Role: {workspace.role}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              You don't have any workspaces yet. Create one to get started!
            </p>
            <CreateWorkspaceDialog />
          </div>
        )}

        <div className="flex gap-4">
          <Button asChild>
            <Link href="/me">View Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

