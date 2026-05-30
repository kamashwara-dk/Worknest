import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { NotificationPanel } from '@/components/layout/NotificationPanel';
import { AppShell } from '@/components/layout/AppShell';
import { WorkspaceBootstrap } from '@/components/layout/WorkspaceBootstrap';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verify the workspace exists and the user is a member
  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) redirect('/workspaces');

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) redirect('/workspaces');

  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: dbUser.id, workspaceId: workspace.id } },
  });
  if (!membership) redirect('/workspaces');

  return (
    <div className="min-h-screen bg-[#0A1828]">
      {/* Hydrates the Zustand workspace store on the client */}
      <WorkspaceBootstrap
        workspaceId={workspace.id}
        workspaceSlug={workspace.slug}
        workspaceName={workspace.name}
        role={membership.role}
      />
      <Sidebar />
      <Topbar />
      <NotificationPanel />
      <AppShell>{children}</AppShell>
    </div>
  );
}
