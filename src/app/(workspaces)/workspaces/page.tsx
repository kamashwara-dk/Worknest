'use client';

import { trpc } from '@/lib/trpc/client';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, Plus, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function WorkspacesPage() {
  const router = useRouter();
  const { setWorkspace } = useWorkspaceStore();
  const { data: workspaces, isLoading } = trpc.workspaces.list.useQuery();

  function handleSelect(ws: { id: string; slug: string; name: string; role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' }) {
    setWorkspace({ id: ws.id, slug: ws.slug, name: ws.name, role: ws.role });
    router.push(`/w/${ws.slug}/dashboard`);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-[#0A1828] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#E8F0F8] font-syne">Your Workspaces</h1>
          <p className="text-[#7A9BBF] mt-2">Select a workspace to continue</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-[#0D1F35] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {workspaces?.map((ws) => (
              <motion.button
                key={ws.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelect(ws)}
                className="w-full flex items-center gap-4 p-5 bg-[#0D1F35] border border-[#1E3A5F] rounded-xl hover:border-[#178582] transition-colors text-left"
              >
                {ws.logoUrl ? (
                  <img src={ws.logoUrl} alt={ws.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#178582]/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-[#178582]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#E8F0F8] truncate">{ws.name}</p>
                  <p className="text-sm text-[#7A9BBF] capitalize">{ws.role.toLowerCase()}</p>
                </div>
              </motion.button>
            ))}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => router.push('/workspaces/new')}
              className="w-full flex items-center gap-4 p-5 border border-dashed border-[#1E3A5F] rounded-xl hover:border-[#178582] hover:bg-[#178582]/5 transition-colors text-[#7A9BBF] hover:text-[#178582]"
            >
              <div className="w-12 h-12 rounded-lg border border-dashed border-current flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-medium">Create a new workspace</span>
            </motion.button>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="mt-8 w-full flex items-center justify-center gap-2 text-[#7A9BBF] hover:text-[#E8F0F8] transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </motion.div>
    </div>
  );
}
