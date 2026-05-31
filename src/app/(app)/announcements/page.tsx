'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pin, X, Megaphone, Globe, Building2, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { toast } from 'sonner';
import { fadeUp, staggerContainer, modalVariants, backdropVariants } from '@/lib/animations';
import { getPriorityColor, formatRelativeTime } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const announcementSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  body: z.string().min(1, 'Body required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  pinned: z.boolean(),
  expiresAt: z.string().optional(),
});
type AnnouncementFormData = z.infer<typeof announcementSchema>;

type Tab = 'workspace' | 'global';

export default function AnnouncementsPage() {
  const [tab, setTab] = useState<Tab>('workspace');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const utils = trpc.useUtils();
  const { workspaceRole } = useWorkspaceStore();
  const { data: meData } = trpc.users.me.useQuery();

  const isManager = workspaceRole === 'MANAGER' || workspaceRole === 'ADMIN' || workspaceRole === 'OWNER';
  const isSuperAdmin = meData?.isSuperAdmin ?? false;

  const { data: workspaceAnnouncements, isLoading: wsLoading } = trpc.announcements.list.useQuery({ limit: 50 });
  const { data: globalAnnouncements, isLoading: globalLoading } = trpc.announcements.global.list.useQuery({ limit: 50 });

  const createWorkspace = trpc.announcements.create.useMutation({
    onSuccess: () => { toast.success('Announcement published!'); utils.announcements.list.invalidate(); setCreateModalOpen(false); reset(); },
    onError: (e) => toast.error(e.message),
  });

  const createGlobal = trpc.announcements.global.create.useMutation({
    onSuccess: () => { toast.success('Global announcement published!'); utils.announcements.global.list.invalidate(); setCreateModalOpen(false); reset(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteWorkspace = trpc.announcements.delete.useMutation({
    onSuccess: () => { toast.success('Deleted'); utils.announcements.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteGlobal = trpc.announcements.global.delete.useMutation({
    onSuccess: () => { toast.success('Deleted'); utils.announcements.global.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { priority: 'MEDIUM', pinned: false },
  });

  const onSubmit = (data: AnnouncementFormData) => {
    const payload = { ...data, expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined };
    if (tab === 'global') {
      createGlobal.mutate(payload);
    } else {
      createWorkspace.mutate(payload);
    }
  };

  const canCreate = tab === 'global' ? isSuperAdmin : isManager;
  const isCreating = createWorkspace.isPending || createGlobal.isPending;

  const wsPinned   = workspaceAnnouncements?.filter((a) => a.pinned)  ?? [];
  const wsRegular  = workspaceAnnouncements?.filter((a) => !a.pinned) ?? [];
  const glbPinned  = globalAnnouncements?.filter((a) => a.pinned)     ?? [];
  const glbRegular = globalAnnouncements?.filter((a) => !a.pinned)    ?? [];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Announcements</h1>
          <p className="text-zinc-400 text-sm mt-1">Company-wide updates and workspace news</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="self-start sm:self-auto flex items-center gap-2 shimmer-btn text-white font-semibold px-4 py-2 rounded-lg text-sm hover:shadow-glow-primary transition-all"
          >
            <Plus size={16} />
            {tab === 'global' ? 'Global Announcement' : 'New Announcement'}
          </button>
        )}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex bg-[#0D1F35] border border-[#1E3A5F] rounded-xl p-1">
        <button
          onClick={() => setTab('workspace')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'workspace' ? 'bg-[#178582] text-white shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Building2 size={14} />
          Workspace Announcements
        </button>
        <button
          onClick={() => setTab('global')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'global' ? 'bg-[#178582] text-white shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Globe size={14} />
          Global Updates
          {(globalAnnouncements?.length ?? 0) > 0 && (
            <span className="bg-[#BFA181] text-[#0A1828] text-xs font-bold px-1.5 py-0.5 rounded-full">
              {globalAnnouncements!.length}
            </span>
          )}
        </button>
      </motion.div>

      {/* ── Workspace tab ── */}
      <AnimatePresence mode="wait">
        {tab === 'workspace' && (
          <motion.div key="workspace" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }} className="space-y-4">
            {wsLoading ? (
              <LoadingSkeleton />
            ) : workspaceAnnouncements?.length === 0 ? (
              <EmptyState icon={<Building2 className="w-10 h-10 opacity-30" />} message="No workspace announcements yet" sub={isManager ? 'Click "New Announcement" to publish one' : 'Check back later'} />
            ) : (
              <>
                {wsPinned.length > 0 && (
                  <Section label="Pinned" icon={<Pin size={12} />}>
                    {wsPinned.map((ann) => (
                      <AnnouncementCard key={ann.id} ann={ann} canDelete={isManager}
                        onDelete={() => deleteWorkspace.mutate({ id: ann.id })} isPinned />
                    ))}
                  </Section>
                )}
                {wsRegular.length > 0 && (
                  <Section label={wsPinned.length > 0 ? 'Recent' : undefined}>
                    {wsRegular.map((ann) => (
                      <AnnouncementCard key={ann.id} ann={ann} canDelete={isManager}
                        onDelete={() => deleteWorkspace.mutate({ id: ann.id })} />
                    ))}
                  </Section>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ── Global tab ── */}
        {tab === 'global' && (
          <motion.div key="global" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.15 }} className="space-y-4">
            {/* Super admin badge */}
            {isSuperAdmin && (
              <div className="flex items-center gap-2 bg-[#BFA181]/10 border border-[#BFA181]/30 rounded-lg px-4 py-2.5">
                <Globe size={14} className="text-[#BFA181]" />
                <p className="text-xs text-[#BFA181] font-medium">
                  You are a Super Admin — global announcements are visible to all users across all workspaces.
                </p>
              </div>
            )}

            {globalLoading ? (
              <LoadingSkeleton />
            ) : globalAnnouncements?.length === 0 ? (
              <EmptyState icon={<Globe className="w-10 h-10 opacity-30" />} message="No global announcements" sub={isSuperAdmin ? 'Post a system-wide update for all users' : 'No system-wide updates at this time'} />
            ) : (
              <>
                {glbPinned.length > 0 && (
                  <Section label="Pinned" icon={<Pin size={12} />}>
                    {glbPinned.map((ann) => (
                      <AnnouncementCard key={ann.id} ann={ann} canDelete={isSuperAdmin}
                        onDelete={() => deleteGlobal.mutate({ id: ann.id })} isPinned isGlobal />
                    ))}
                  </Section>
                )}
                {glbRegular.length > 0 && (
                  <Section label={glbPinned.length > 0 ? 'Recent' : undefined}>
                    {glbRegular.map((ann) => (
                      <AnnouncementCard key={ann.id} ann={ann} canDelete={isSuperAdmin}
                        onDelete={() => deleteGlobal.mutate({ id: ann.id })} isGlobal />
                    ))}
                  </Section>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create modal */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              className="relative w-full max-w-lg glass-card rounded-2xl p-6 z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  {tab === 'global' ? <Globe size={18} className="text-[#BFA181]" /> : <Building2 size={18} className="text-[#178582]" />}
                  <h2 className="font-display text-xl font-bold text-white">
                    {tab === 'global' ? 'New Global Announcement' : 'New Announcement'}
                  </h2>
                </div>
                <button onClick={() => setCreateModalOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
              </div>

              {tab === 'global' && (
                <div className="flex items-center gap-2 bg-[#BFA181]/10 border border-[#BFA181]/20 rounded-lg px-3 py-2 mb-4">
                  <Globe size={13} className="text-[#BFA181] shrink-0" />
                  <p className="text-xs text-[#BFA181]">This will be visible to all users across every workspace.</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Title</label>
                  <input {...register('title')} placeholder="Announcement title…"
                    className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary text-sm" />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Body</label>
                  <textarea {...register('body')} rows={4} placeholder="Write your announcement…"
                    className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary text-sm resize-none" />
                  {errors.body && <p className="text-red-400 text-xs mt-1">{errors.body.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Priority</label>
                    <select {...register('priority')} className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white focus:outline-none focus:border-primary text-sm appearance-none">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Expires At</label>
                    <input type="date" {...register('expiresAt')} className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white focus:outline-none focus:border-primary text-sm" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('pinned')} className="w-4 h-4 rounded border-border bg-surface text-primary" />
                  <span className="text-sm text-zinc-300">Pin this announcement</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setCreateModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={isCreating}
                    className="flex-1 shimmer-btn text-white font-semibold py-2.5 rounded-lg transition-all hover:shadow-glow-primary disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                    {isCreating ? <Loader2 size={14} className="animate-spin" /> : null}
                    Publish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Section({ label, icon, children }: { label?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      {label && (
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
          {icon}{label}
        </h2>
      )}
      {children}
    </div>
  );
}

function AnnouncementCard({ ann, canDelete, onDelete, isPinned, isGlobal }: {
  ann: { id: string; title: string; body: string; priority: string; createdAt: Date };
  canDelete: boolean;
  onDelete: () => void;
  isPinned?: boolean;
  isGlobal?: boolean;
}) {
  return (
    <motion.div variants={fadeUp}
      className={`glass-card rounded-xl p-5 relative group ${isPinned ? 'border-l-4 border-primary' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {isPinned && <Pin size={12} className="text-primary shrink-0" />}
            {isGlobal && <Globe size={12} className="text-[#BFA181] shrink-0" />}
            <h3 className="font-display font-semibold text-white truncate">{ann.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${getPriorityColor(ann.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')}`}>
              {ann.priority}
            </span>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed">{ann.body}</p>
          <p className="text-zinc-600 text-xs mt-3">{formatRelativeTime(ann.createdAt)}</p>
        </div>
        {canDelete && (
          <button onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 p-1 shrink-0">
            <X size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-surface rounded-xl animate-pulse" />)}
    </div>
  );
}

function EmptyState({ icon, message, sub }: { icon: React.ReactNode; message: string; sub: string }) {
  return (
    <div className="text-center py-16 text-zinc-600">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="font-medium text-zinc-500">{message}</p>
      <p className="text-sm mt-1">{sub}</p>
    </div>
  );
}
