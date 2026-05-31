'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, LogOut, Link2, ArrowRight, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

type Tab = 'workspaces' | 'join';

export default function WorkspacesPage() {
  const router = useRouter();
  const { setWorkspace } = useWorkspaceStore();
  const [tab, setTab] = useState<Tab>('workspaces');
  const [inviteToken, setInviteToken] = useState('');

  const { data: workspaces, isLoading } = trpc.workspaces.list.useQuery();

  const acceptMutation = trpc.invitations.accept.useMutation({
    onSuccess: ({ membership, workspace }) => {
      setWorkspace({ id: workspace.id, slug: workspace.slug, name: workspace.name, role: membership.role });
      toast.success(`Joined "${workspace.name}"`);
      router.push(`/w/${workspace.slug}/dashboard`);
    },
    onError: (err) => toast.error(err.message),
  });

  const joinByCodeMutation = trpc.workspaces.joinByCode.useMutation({
    onSuccess: ({ membership, workspace }) => {
      setWorkspace({ id: workspace.id, slug: workspace.slug, name: workspace.name, role: membership.role });
      toast.success(`Joined "${workspace.name}"`);
      router.push(`/w/${workspace.slug}/dashboard`);
    },
    onError: (err) => toast.error(err.message),
  });

  const joinLinkMutation = trpc.workspaces.inviteLinks.accept.useMutation({
    onSuccess: ({ membership, workspace }) => {
      setWorkspace({ id: workspace.id, slug: workspace.slug, name: workspace.name, role: membership.role });
      toast.success(`Joined "${workspace.name}"`);
      router.push(`/w/${workspace.slug}/dashboard`);
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSelect(ws: { id: string; slug: string; name: string; role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' }) {
    setWorkspace({ id: ws.id, slug: ws.slug, name: ws.name, role: ws.role });
    router.push(`/w/${ws.slug}/dashboard`);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  // Extract token from a full invite URL or use raw token/code
  function parseInput(input: string): { type: 'link' | 'code'; value: string } {
    const trimmed = input.trim();
    // Full URL — extract token from /invite/TOKEN
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.split('/');
      const inviteIdx = parts.indexOf('invite');
      if (inviteIdx !== -1 && parts[inviteIdx + 1]) {
        return { type: 'link', value: parts[inviteIdx + 1] };
      }
    } catch { /* not a URL */ }

    // Looks like a join code: 3 chars, dash, 3 chars (e.g. XK9-TZ2)
    if (/^[A-Z0-9]{3}-?[A-Z0-9]{3}$/i.test(trimmed.replace(/\s/g, ''))) {
      return { type: 'code', value: trimmed };
    }

    // Default: treat as invite link token
    return { type: 'link', value: trimmed };
  }

  const isJoinPending = acceptMutation.isPending || joinByCodeMutation.isPending || joinLinkMutation.isPending;

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteToken.trim()) return;
    const { type, value } = parseInput(inviteToken);
    if (type === 'code') {
      joinByCodeMutation.mutate({ code: value });
    } else {
      joinLinkMutation.mutate({ token: value });
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1828] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#178582] to-[#178582]/60 flex items-center justify-center mx-auto mb-4">
            <span className="font-bold text-white text-xl">W</span>
          </div>
          <h1 className="text-3xl font-bold text-[#E8F0F8] font-syne">WorkNest</h1>
          <p className="text-[#7A9BBF] mt-1 text-sm">Choose how you'd like to continue</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#0D1F35] border border-[#1E3A5F] rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab('workspaces')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'workspaces'
                ? 'bg-[#178582] text-white shadow'
                : 'text-[#7A9BBF] hover:text-[#E8F0F8]'
            }`}
          >
            My Workspaces
          </button>
          <button
            onClick={() => setTab('join')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'join'
                ? 'bg-[#178582] text-white shadow'
                : 'text-[#7A9BBF] hover:text-[#E8F0F8]'
            }`}
          >
            Join a Workspace
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'workspaces' ? (
            <motion.div
              key="workspaces"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {isLoading ? (
                <>
                  <div className="h-20 bg-[#0D1F35] rounded-xl animate-pulse" />
                  <div className="h-20 bg-[#0D1F35] rounded-xl animate-pulse" />
                </>
              ) : workspaces?.length === 0 ? (
                <div className="text-center py-10 text-[#7A9BBF]">
                  <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium text-[#E8F0F8]">No workspaces yet</p>
                  <p className="text-sm mt-1">Create one or join via an invite link</p>
                </div>
              ) : (
                workspaces?.map((ws) => (
                  <motion.button
                    key={ws.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelect(ws)}
                    className="w-full flex items-center gap-4 p-5 bg-[#0D1F35] border border-[#1E3A5F] rounded-xl hover:border-[#178582] transition-colors text-left group"
                  >
                    {ws.logoUrl ? (
                      <img src={ws.logoUrl} alt={ws.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#178582]/20 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-[#178582]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#E8F0F8] truncate">{ws.name}</p>
                      <p className="text-sm text-[#7A9BBF] capitalize">{ws.role.toLowerCase()}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#7A9BBF] group-hover:text-[#178582] transition-colors shrink-0" />
                  </motion.button>
                ))
              )}

              {/* Create new */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => router.push('/workspaces/new')}
                className="w-full flex items-center gap-4 p-5 border border-dashed border-[#1E3A5F] rounded-xl hover:border-[#178582] hover:bg-[#178582]/5 transition-colors text-[#7A9BBF] hover:text-[#178582]"
              >
                <div className="w-12 h-12 rounded-lg border border-dashed border-current flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-medium">Create a new workspace</span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.15 }}
            >
              <div className="bg-[#0D1F35] border border-[#1E3A5F] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-[#BFA181]/20 flex items-center justify-center shrink-0">
                    <Link2 className="w-5 h-5 text-[#BFA181]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#E8F0F8]">Join a workspace</p>
                    <p className="text-xs text-[#7A9BBF]">Enter a code or paste an invite link</p>
                  </div>
                </div>

                <form onSubmit={handleJoin} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={inviteToken}
                      onChange={(e) => setInviteToken(e.target.value)}
                      placeholder="XK9-TZ2  or  https://…/invite/abc123"
                      className="w-full bg-[#112540] border border-[#1E3A5F] rounded-lg px-4 py-3 pr-10 text-[#E8F0F8] placeholder-[#7A9BBF]/60 text-sm focus:outline-none focus:border-[#178582] transition-colors font-mono tracking-wide"
                      autoFocus
                    />
                    {inviteToken && (
                      <button
                        type="button"
                        onClick={() => setInviteToken('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A9BBF] hover:text-[#E8F0F8]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Hint about what was detected */}
                  {inviteToken.trim() && (
                    <p className="text-xs text-[#7A9BBF]">
                      {/^[A-Z0-9]{3}-?[A-Z0-9]{3}$/i.test(inviteToken.trim().replace(/\s/g, ''))
                        ? '🔑 Workspace join code detected'
                        : '🔗 Invite link detected'}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!inviteToken.trim() || isJoinPending}
                    className="w-full flex items-center justify-center gap-2 bg-[#BFA181] hover:bg-[#BFA181]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#0A1828] font-semibold py-3 rounded-lg transition-colors"
                  >
                    {isJoinPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Joining…</>
                    ) : (
                      <><ArrowRight className="w-4 h-4" /> Join Workspace</>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-[#1E3A5F]" />
                  <span className="text-xs text-[#7A9BBF]">two ways to join</span>
                  <div className="flex-1 h-px bg-[#1E3A5F]" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-[#7A9BBF]">
                  <div className="bg-[#112540] rounded-lg p-3 border border-[#1E3A5F]">
                    <p className="font-semibold text-[#E8F0F8] mb-1">🔑 Join code</p>
                    <p>A short code like <span className="font-mono text-[#BFA181]">XK9-TZ2</span> shared by your admin</p>
                  </div>
                  <div className="bg-[#112540] rounded-lg p-3 border border-[#1E3A5F]">
                    <p className="font-semibold text-[#E8F0F8] mb-1">🔗 Invite link</p>
                    <p>A full URL from your admin's workspace settings</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
