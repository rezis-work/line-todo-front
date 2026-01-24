'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useLogout } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';
import { getRefreshToken } from '@/lib/auth/token-store';
import { Button } from '@/components/ui/button';
import { WorkspaceSwitcher } from '@/components/workspaces/WorkspaceSwitcher';
import { Settings, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect if user is in a workspace context
  const workspaceMatch = pathname.match(/^\/w\/([^/]+)/);
  const workspaceId = workspaceMatch ? workspaceMatch[1] : null;

  const handleLogout = () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      logout.mutate({ refreshToken });
    } else {
      // If no refresh token, just clear local state
      logout.mutate({ refreshToken: '' });
    }
    setMobileMenuOpen(false);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold hover:opacity-80 transition-opacity">
              Line Todo
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {user && (
                <>
                  <WorkspaceSwitcher />
                  {workspaceId && (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/w/${workspaceId}/settings`}>
                        <Settings className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
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

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {user && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Workspace
                          </label>
                          <WorkspaceSwitcher />
                        </div>
                        {workspaceId && (
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleNavigation(`/w/${workspaceId}/settings`)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Workspace Settings
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleNavigation('/me')}
                        >
                          Profile
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleLogout}
                      disabled={logout.isPending}
                    >
                      {logout.isPending ? 'Logging out...' : 'Logout'}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}

