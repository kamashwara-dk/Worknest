'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pin, X, Megaphone } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { fadeUp, staggerContainer, modalVariants, backdropVariants } from '@/lib/animations';
import { getPriorityColor, formatRelativeTime } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';
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

export default function AnnouncementsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const utils = trpc.useUtils();
  const { data: meData } = trpc.users.me.useQuery();
  const isManager = meData?.role === 'MANAGER' || meData?.role === 'ADMIN';

  const { data: announcements, isLoading } = trpc.announcements.list.useQuery({ limit: 50 });

  const createAnnouncement = trpc.announcements.create.useMutation({
    onSuccess: () => {
      toast.success('Announcement published!');
      utils.announcements.list.invalidate();
      setCreateModalOpen(false);
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteAnnouncement = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      toast.success('Announcement deleted');
      utils.announcements.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
  });

  const onSubmit = (data: AnnouncementFormData) => {
    createAnnouncement.mutate({
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    });
  };

  const pinnedAnnouncements = announcements?.filter((a) => a.pinned) ?? [];
  const regularAnnouncements = announcements?.filter((a) => !a.pinned) ?? [];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Announcements</h1>
          <p className="text-zinc-400 text-sm mt-1">Company-wide updates and news</p>
        </div>
        {isManager && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 shimmer-btn text-white font-semibold px-4 py-2 rounded-lg text-sm hover:shadow-glow-primary transition-all"
          >
            <Plus size={16} />
            New Announcement
          </button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Pinned */}
          {pinnedAnnouncements.length > 0 && (
            <motion.div variants={staggerContainer} className="space-y-3">
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Pin size={12} />
                Pinned
              </h2>
              {pinnedAnnouncements.map((ann) => (
                <motion.div
                  key={ann.id}
                  variants={fadeUp}
                  className="glass-card rounded-xl p-5 border-l-4 border-primary relative group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Pin size={12} className="text-primary" />
                        <h3 className="font-display font-semibold text-white">{ann.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(ann.priority)}`}>
                          {ann.priority}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed">{ann.body}</p>
                      <p className="text-zinc-600 text-xs mt-3">{formatRelativeTime(ann.createdAt)}</p>
                    </div>
                    {isManager && (
                      <button
                        onClick={() => deleteAnnouncement.mutate({ id: ann.id })}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 p-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Regular */}
          {regularAnnouncements.length > 0 && (
            <motion.div variants={staggerContainer} className="space-y-3">
              {pinnedAnnouncements.length > 0 && (
                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Recent</h2>
              )}
              {regularAnnouncements.map((ann) => (
                <motion.div
                  key={ann.id}
                  variants={fadeUp}
                  className="glass-card rounded-xl p-5 relative group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Megaphone size={14} className="text-zinc-400" />
                        <h3 className="font-display font-semibold text-white">{ann.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(ann.priority)}`}>
                          {ann.priority}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed">{ann.body}</p>
                      <p className="text-zinc-600 text-xs mt-3">{formatRelativeTime(ann.createdAt)}</p>
                    </div>
                    {isManager && (
                      <button
                        onClick={() => deleteAnnouncement.mutate({ id: ann.id })}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 p-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {announcements?.length === 0 && (
            <div className="text-center py-12 text-zinc-600">
              No announcements yet
            </div>
          )}
        </>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setCreateModalOpen(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-lg glass-card rounded-2xl p-6 z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">New Announcement</h2>
                <button onClick={() => setCreateModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Title</label>
                  <input
                    {...register('title')}
                    placeholder="Announcement title..."
                    className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary text-sm"
                  />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Body</label>
                  <textarea
                    {...register('body')}
                    rows={4}
                    placeholder="Write your announcement..."
                    className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary text-sm resize-none"
                  />
                  {errors.body && <p className="text-red-400 text-xs mt-1">{errors.body.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Priority</label>
                    <select
                      {...register('priority')}
                      className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white focus:outline-none focus:border-primary text-sm appearance-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Expires At</label>
                    <input
                      type="date"
                      {...register('expiresAt')}
                      className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white focus:outline-none focus:border-primary text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pinned"
                    {...register('pinned')}
                    className="w-4 h-4 rounded border-border bg-surface text-primary"
                  />
                  <label htmlFor="pinned" className="text-sm text-zinc-300">
                    Pin this announcement
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createAnnouncement.isPending}
                    className="flex-1 shimmer-btn text-white font-semibold py-2.5 rounded-lg transition-all hover:shadow-glow-primary disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {createAnnouncement.isPending ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : null}
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
