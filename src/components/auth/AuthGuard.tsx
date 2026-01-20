'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMeQuery } from '@/hooks/useAuth';
import { isAuthenticated } from '@/lib/auth/token-store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const hasToken = isAuthenticated();
  const { data: user, isLoading, isError } = useMeQuery();

  // Wait for client-side to take over to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!hasToken) {
      router.push('/login');
      return;
    }

    if (!isLoading && isError) {
      router.push('/login');
    }
  }, [mounted, hasToken, isLoading, isError, router]);

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null;
  }

  // If no token, don't render anything (redirecting)
  if (!hasToken) {
    return null;
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If error or no user, don't render (redirecting)
  if (isError || !user) {
    return null;
  }

  // If authenticated, render children
  return <>{children}</>;
}

