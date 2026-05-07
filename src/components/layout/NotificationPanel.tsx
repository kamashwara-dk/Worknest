'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check, Trash2 } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { trpc } from '@/lib/trpc/client';
import { formatRelativeTime } from '@/lib/utils';
import { notificationPanelVariants } from '@/lib/animations';

export function NotificationPanel() {
  const { notificationPanelOpen, setNotificationPanelOpen } = useUIStore();
  const { notifications, markRead, markAllRead } = useNotificationStore();

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: (_, { id }) => markRead(id),
  });

  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => markAllRead(),
  });

  const clearMutation = trpc.notifications.clear.useMutation();

  return (
    <AnimatePresence>
      {notificationPanelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setNotificationPanelOpen(false)}
          />
          <motion.div
            variants={notificationPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 w-80 z-50 bg-surface border-l border-border flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-primary" />
                <h2 className="font-display font-semibold text-white">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                  title="Mark all read"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => clearMutation.mutate()}
                  className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
                  title="Clear read"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setNotificationPanelOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Bell size={32} className="text-zinc-600 mb-3" />
                  <p className="text-zinc-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-[#112540] transition-colors cursor-pointer ${
                        !notif.read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        if (!notif.read) {
                          markReadMutation.mutate({ id: notif.id });
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          notif.read ? 'bg-zinc-600' : 'bg-primary'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{notif.title}</p>
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{notif.body}</p>
                          <p className="text-xs text-zinc-600 mt-1">
                            {formatRelativeTime(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
