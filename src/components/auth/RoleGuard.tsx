'use client';

import { ReactNode } from 'react';
import { useCurrentWorkspace } from '@/hooks/useCurrentWorkspace';
import type { WorkspaceRole } from '@/types/api';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: WorkspaceRole[];
  fallback?: ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {
  const { role, isLoading } = useCurrentWorkspace();

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }

  // Check if user has required role
  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

