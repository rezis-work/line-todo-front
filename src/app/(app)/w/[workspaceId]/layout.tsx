import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { WorkspaceLayoutContent } from './WorkspaceLayoutContent';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { workspaceId } = await params;

  return (
    <WorkspaceProvider workspaceId={workspaceId}>
      <WorkspaceLayoutContent>{children}</WorkspaceLayoutContent>
    </WorkspaceProvider>
  );
}

