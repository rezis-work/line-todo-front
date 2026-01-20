'use client';

import Link from 'next/link';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useMeQuery } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/useAuth';
import { getRefreshToken } from '@/lib/auth/token-store';
import { Button } from '@/components/ui/button';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user } = useMeQuery();
  const logout = useLogout();

  const handleLogout = () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      logout.mutate({ refreshToken });
    } else {
      // If no refresh token, just clear local state
      logout.mutate({ refreshToken: '' });
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Line Todo</h1>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <Link
                    href="/me"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {user.name || user.email}
                  </Link>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={logout.isPending}
              >
                {logout.isPending ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}

