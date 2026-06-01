'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Trash2, Loader2, Shield, RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { fadeUp, staggerContainer } from '@/lib/animations';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { PageTransition } from '@/components/ui/PageTransition';

export default function AdminFeedbackPage() {
  const utils = trpc.useUtils();
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.feedback.list.useInfiniteQuery(
      { limit: 20 },
      { getNextPageParam: (page) => page.nextCursor }
    );

  const deleteMutation = trpc.feedback.delete.useMutation({
    onSuccess: () => {
      utils.feedback.list.invalidate();
      toast.success('Feedback deleted');
    },
    onError: (e) => toast.error(e.message),
  });

  const allItems = data?.pages.flatMap((p) => p.items) ?? [];

  if (error?.data?.code === 'FORBIDDEN') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Shield size={48} className="text-[#7A9BBF] mx-auto mb-4 opacity-40" />
        <h1 className="text-xl font-bold text-[#E8F0F8] mb-2">Super Admin Access Required</h1>
        <p className="text-[#7A9BBF] text-sm">
          Only users with <code className="text-[#178582]">isSuperAdmin = true</code> can view feedback submissions.
        </p>
      </div>
    );
  }

  return (
    <PageTransition>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-[#178582]" />
              <span className="text-xs text-[#7A9BBF] uppercase tracking-wider font-medium">Super Admin</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">User Feedback</h1>
            <p className="text-zinc-400 text-sm mt-1">
              {allItems.length} submission{allItems.length !== 1 ? 's' : ''} from authenticated users
            </p>
          </div>
          <button
            onClick={() => utils.feedback.list.invalidate()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0D1F35] border border-[#1E3A5F] text-[#7A9BBF] hover:text-[#E8F0F8] hover:border-[#178582] transition-all text-sm"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </motion.div>

        {/* Submissions */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-[#0D1F35] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : allItems.length === 0 ? (
          <motion.div variants={fadeUp} className="glass-card rounded-xl p-12 text-center">
            <MessageSquare size={40} className="text-[#7A9BBF] mx-auto mb-3 opacity-40" />
            <p className="text-[#E8F0F8] font-medium">No feedback yet</p>
            <p className="text-[#7A9BBF] text-sm mt-1">Submissions from the dashboard will appear here.</p>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} className="space-y-3">
            {allItems.map((item) => (
              <motion.div
                key={item.id}
                variants={fadeUp}
                className="glass-card rounded-xl p-5 group"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <img
                    src={
                      item.user.avatar ??
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user.name)}&background=178582&color=fff&size=40`
                    }
                    alt={item.user.name}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-[#E8F0F8] text-sm">{item.user.name}</span>
                      <span className="text-xs text-[#7A9BBF]">{item.user.email}</span>
                      <span className="text-xs text-[#7A9BBF] ml-auto">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">{item.emoji}</span>
                      <p className="text-sm text-zinc-300 leading-relaxed">{item.message}</p>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteMutation.mutate({ id: item.id })}
                    disabled={deleteMutation.isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 flex-shrink-0"
                    title="Delete submission"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Load more */}
            {hasNextPage && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0D1F35] border border-[#1E3A5F] text-[#7A9BBF] hover:text-[#E8F0F8] hover:border-[#178582] transition-all text-sm"
                >
                  {isFetchingNextPage ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    'Load more'
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </PageTransition>
  );
}
