'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/useAuth';
import { getRefreshToken } from '@/lib/auth/token-store';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import Link from 'next/link';

export default function MePage() {
  const { user, isLoading } = useAuth();
  const logout = useLogout();

  const handleLogout = () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      logout.mutate({ refreshToken });
    } else {
      logout.mutate({ refreshToken: '' });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your account information
          </p>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <p className="mt-1 text-sm">{user.email}</p>
          </div>

          {user.name && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="mt-1 text-sm">{user.name}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Member since
            </label>
            <p className="mt-1 text-sm">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="pt-4 border-t">
            <label className="text-sm font-medium text-muted-foreground">
              Theme
            </label>
            <div className="mt-2">
              <ThemeSwitcher />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="destructive" onClick={handleLogout} disabled={logout.isPending}>
            {logout.isPending ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>
    </div>
  );
}

