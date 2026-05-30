'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkspaceState {
  workspaceId: string | null;
  workspaceSlug: string | null;
  workspaceName: string | null;
  workspaceRole: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | null;

  setWorkspace: (ws: {
    id: string;
    slug: string;
    name: string;
    role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER';
  }) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspaceId: null,
      workspaceSlug: null,
      workspaceName: null,
      workspaceRole: null,

      setWorkspace: ({ id, slug, name, role }) =>
        set({ workspaceId: id, workspaceSlug: slug, workspaceName: name, workspaceRole: role }),

      clearWorkspace: () =>
        set({ workspaceId: null, workspaceSlug: null, workspaceName: null, workspaceRole: null }),
    }),
    {
      name: 'worknest-workspace',
    }
  )
);
