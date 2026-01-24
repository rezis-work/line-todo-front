'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isAuthenticated, clearTokens } from '@/lib/auth/token-store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const { user, isLoading, isError } = useAuth();

  // Wait for client-side to take over to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setHasToken(isAuthenticated());
  }, []);

  // Update hasToken whenever authentication state might change
  useEffect(() => {
    if (mounted) {
      const currentTokenState = isAuthenticated();
      if (currentTokenState !== hasToken) {
        setHasToken(currentTokenState);
      }
    }
  }, [mounted, hasToken, user]); // Update when user data loads or changes

  useEffect(() => {
    if (!mounted) return;

    // Don't redirect if we're already on login or register page
    if (pathname === '/login' || pathname === '/register') {
      return;
    }

    if (!hasToken) {
      router.push('/login');
      return;
    }

    // If auth query failed, clear tokens and redirect to login
    if (!isLoading && isError) {
      clearTokens();
      router.push('/login');
    }
  }, [mounted, hasToken, isLoading, isError, pathname, router]);

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

  // If error, don't render (redirecting)
  if (isError) {
    return null;
  }

  // If we have a token but user is undefined and not loading, wait a bit for query to start
  // This handles the case after login when tokens are set but user query hasn't started yet
  if (hasToken && !user && !isLoading && !isError) {
    // Give the query a moment to start - if it's enabled, it should start soon
    // Show loading for a brief moment
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  // Note: user might be undefined initially, but components should handle that gracefully
  return <>{children}</>;
}

