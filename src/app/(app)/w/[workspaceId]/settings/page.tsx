'use client';

import { useCurrentWorkspace } from '@/hooks/useCurrentWorkspace';
import { useWorkspaceMembersQuery } from '@/hooks/useWorkspaces';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { AddMemberDialog } from '@/components/workspaces/AddMemberDialog';
import { UpdateRoleDialog } from '@/components/workspaces/UpdateRoleDialog';
import { RemoveMemberDialog } from '@/components/workspaces/RemoveMemberDialog';
import { RenameWorkspaceDialog } from '@/components/workspaces/RenameWorkspaceDialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WorkspaceRole } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

export default function WorkspaceSettingsPage() {
  const { workspace, workspaceId } = useCurrentWorkspace();
  const { user } = useAuth();
  const { data: members, isLoading } = useWorkspaceMembersQuery(
    workspaceId || ''
  );

  if (!workspaceId) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href={`/w/${workspaceId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workspace
            </Link>
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Workspace Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage members and permissions for {workspace?.name}
          </p>
        </div>

        <div className="space-y-6">
          {/* General Settings Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">General Settings</h2>
            <div className="rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Workspace Name
                  </label>
                  <p className="text-sm font-medium">{workspace?.name}</p>
                </div>
                <RoleGuard allowedRoles={[WorkspaceRole.OWNER]}>
                  <RenameWorkspaceDialog />
                </RoleGuard>
              </div>
            </div>
          </div>

          {/* Members Section */}
          <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Members</h2>
            <RoleGuard
              allowedRoles={[WorkspaceRole.OWNER, WorkspaceRole.ADMIN]}
            >
              <AddMemberDialog workspaceId={workspaceId} />
            </RoleGuard>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading members...</p>
          ) : members && members.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="rounded-md border min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.userId}>
                        <TableCell className="font-medium">
                          {member.name || 'No name'}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {member.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <RoleGuard
                              allowedRoles={[
                                WorkspaceRole.OWNER,
                                WorkspaceRole.ADMIN,
                              ]}
                            >
                              <UpdateRoleDialog
                                workspaceId={workspaceId}
                                member={member}
                              />
                            </RoleGuard>
                            <RoleGuard
                              allowedRoles={[
                                WorkspaceRole.OWNER,
                                WorkspaceRole.ADMIN,
                              ]}
                            >
                              {member.userId !== user?.id && (
                                <RemoveMemberDialog
                                  workspaceId={workspaceId}
                                  member={member}
                                />
                              )}
                            </RoleGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No members found. Add a member to get started.
            </p>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

