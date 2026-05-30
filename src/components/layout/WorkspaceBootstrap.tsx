'use client';

import { useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import type { WorkspaceRole } from '@prisma/client';

interface Props {
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
  role: WorkspaceRole;
}

/**
 * Hydrates the Zustand workspace store from server-resolved data.
 * Rendered inside the workspace layout so the store is always in sync
 * with the URL — even on hard refresh or direct navigation.
 */
export function WorkspaceBootstrap({ workspaceId, workspaceSlug, workspaceName, role }: Props) {
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  useEffect(() => {
    setWorkspace({ id: workspaceId, slug: workspaceSlug, name: workspaceName, role });
  }, [workspaceId, workspaceSlug, workspaceName, role, setWorkspace]);

  return null;
}
