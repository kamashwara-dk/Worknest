'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Loader2, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

const EMOJIS = ['💬', '🚀', '✅', '🔥', '💡', '👏', '❤️', '⭐'];

export function FeedbackWidget() {
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState('💬');
  const [done, setDone] = useState(false);

  const submit = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      setDone(true);
      setMessage('');
      setTimeout(() => setDone(false), 4000);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    submit.mutate({ message: message.trim(), emoji });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={16} className="text-[#178582]" />
        <h2 className="font-display font-semibold text-white text-sm">Share Feedback</h2>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-6 gap-3 text-center"
          >
            <CheckCircle size={32} className="text-[#178582]" />
            <p className="text-sm font-medium text-[#E8F0F8]">Thanks for your feedback!</p>
            <p className="text-xs text-[#7A9BBF]">We read every submission.</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            {/* Emoji row */}
            <div className="flex gap-1.5 flex-wrap">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-8 h-8 rounded-lg text-base transition-all ${
                    emoji === e
                      ? 'bg-[#178582]/20 ring-1 ring-[#178582] scale-110'
                      : 'bg-[#112540] hover:bg-[#1E3A5F]'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            {/* Text area */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's on your mind? Feature requests, bugs, praise…"
              maxLength={500}
              rows={3}
              required
              className="w-full bg-[#112540] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-[#E8F0F8] placeholder-[#7A9BBF]/60 focus:outline-none focus:border-[#178582] transition-colors resize-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A9BBF]">{message.length}/500</span>
              <button
                type="submit"
                disabled={!message.trim() || submit.isPending}
                className="flex items-center gap-2 bg-[#178582] hover:bg-[#178582]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {submit.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Send
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
