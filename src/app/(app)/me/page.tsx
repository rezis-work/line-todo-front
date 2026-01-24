'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUser';
import { getRefreshToken } from '@/lib/auth/token-store';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import { CreateWorkspaceDialog } from '@/components/workspaces/CreateWorkspaceDialog';
import { UpdateProfileForm } from '@/components/users/UpdateProfileForm';
import { ChangePasswordForm } from '@/components/users/ChangePasswordForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MePage() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const logout = useLogout();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const handleLogout = () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      logout.mutate({ refreshToken });
    } else {
      logout.mutate({ refreshToken: '' });
    }
  };

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authUser || !profile) {
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

        {/* Workspace Count Stat Card */}
        <Card>
          <CardHeader>
            <CardTitle>Workspaces</CardTitle>
            <CardDescription>Total number of workspaces you're a member of</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile.workspaceCount}</div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </div>
              <UpdateProfileForm
                user={profile}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                trigger={<Button variant="outline">Edit Profile</Button>}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="mt-1 text-sm">{profile.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="mt-1 text-sm">
                {profile.name || <span className="text-muted-foreground italic">Not set</span>}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Member since
              </label>
              <p className="mt-1 text-sm">
                {new Date(profile.createdAt).toLocaleDateString('en-US', {
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
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm
              open={passwordDialogOpen}
              onOpenChange={setPasswordDialogOpen}
              trigger={
                <Button variant="outline">Change Password</Button>
              }
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 flex-wrap">
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <CreateWorkspaceDialog />
          <Button variant="destructive" onClick={handleLogout} disabled={logout.isPending}>
            {logout.isPending ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>
    </div>
  );
}

