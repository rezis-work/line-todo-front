'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentWorkspace } from '@/hooks/useCurrentWorkspace';

interface WorkspaceLayoutContentProps {
  children: React.ReactNode;
}

export function WorkspaceLayoutContent({
  children,
}: WorkspaceLayoutContentProps) {
  const router = useRouter();
  const { isLoading, isError, workspace } = useCurrentWorkspace();

  useEffect(() => {
    if (!isLoading && (isError || !workspace)) {
      // Redirect to home if workspace not found or user lacks access
      router.push('/');
    }
  }, [isLoading, isError, workspace, router]);

  // Show loading state while workspace loads
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Don't render if error or no workspace (redirecting)
  if (isError || !workspace) {
    return null;
  }

  return <>{children}</>;
}

