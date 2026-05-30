'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NewWorkspacePage() {
  const router = useRouter();
  const { setWorkspace } = useWorkspaceStore();
  const [name, setName] = useState('');

  const createMutation = trpc.workspaces.create.useMutation({
    onSuccess: (workspace) => {
      const membership = workspace.memberships[0];
      setWorkspace({
        id: workspace.id,
        slug: workspace.slug,
        name: workspace.name,
        role: membership.role,
      });
      toast.success(`Workspace "${workspace.name}" created`);
      router.push(`/w/${workspace.slug}/dashboard`);
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name: name.trim() });
  }

  return (
    <div className="min-h-screen bg-[#0A1828] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#7A9BBF] hover:text-[#E8F0F8] transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-[#0D1F35] border border-[#1E3A5F] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#178582]/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#178582]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#E8F0F8] font-syne">Create Workspace</h1>
              <p className="text-sm text-[#7A9BBF]">Set up your team's private space</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#7A9BBF] mb-2">
                Workspace name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corp, My Team"
                maxLength={80}
                className="w-full bg-[#112540] border border-[#1E3A5F] rounded-lg px-4 py-3 text-[#E8F0F8] placeholder-[#7A9BBF] focus:outline-none focus:border-[#178582] transition-colors"
                autoFocus
              />
              <p className="text-xs text-[#7A9BBF] mt-1">
                A URL-friendly slug will be generated automatically.
              </p>
            </div>

            <button
              type="submit"
              disabled={!name.trim() || createMutation.isPending}
              className="w-full bg-[#178582] hover:bg-[#178582]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {createMutation.isPending ? 'Creating…' : 'Create Workspace'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
