'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Smile } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/animations';

interface FeedbackMessage {
  id: string;
  name: string;
  text: string;
  emoji: string;
  timestamp: Date;
}

// Seed messages so the space never looks empty on first load
const SEED_MESSAGES: FeedbackMessage[] = [
  { id: 's1', name: 'Arjun M.', text: 'The Kanban board is incredibly smooth. Drag-and-drop feels native!', emoji: '🚀', timestamp: new Date(Date.now() - 1000 * 60 * 12) },
  { id: 's2', name: 'Divya R.', text: 'Love the dark theme and the real-time chat. Feels like Slack but lighter.', emoji: '💬', timestamp: new Date(Date.now() - 1000 * 60 * 7) },
  { id: 's3', name: 'Kiran S.', text: 'Leave management finally makes sense. Approvals in one click!', emoji: '✅', timestamp: new Date(Date.now() - 1000 * 60 * 3) },
];

const EMOJIS = ['💬', '🚀', '✅', '🔥', '💡', '👏', '❤️', '⭐'];

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function FeedbackSpace() {
  const [messages, setMessages] = useState<FeedbackMessage[]>(SEED_MESSAGES);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💬');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMsg: FeedbackMessage = {
      id: `u-${Date.now()}`,
      name: name.trim() || 'Anonymous',
      text: text.trim(),
      emoji: selectedEmoji,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setText('');
    setName('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="py-24 bg-[#0A1828] overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="text-center mb-12"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <MessageSquare size={14} />
            Feedback Space
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-4xl font-bold text-white mb-4">
            Drop your thoughts
          </motion.h2>
          <motion.p variants={fadeUp} className="text-zinc-400 text-lg">
            What do you think about WorkNest? We read every message.
          </motion.p>
        </motion.div>

        {/* Chat window */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-[#0D1F35] border border-[#1E3A5F] rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1E3A5F] bg-[#112540]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-[#7A9BBF] font-medium ml-2"># worknest-feedback</span>
            <span className="ml-auto text-xs text-[#7A9BBF]">{messages.length} messages</span>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto px-5 py-4 space-y-4 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-start gap-3"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#178582] to-[#BFA181] flex items-center justify-center text-sm flex-shrink-0 font-bold text-white">
                    {msg.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-semibold text-[#E8F0F8]">{msg.name}</span>
                      <span className="text-xs text-[#7A9BBF]">{timeAgo(msg.timestamp)}</span>
                    </div>
                    <div className="bg-[#112540] border border-[#1E3A5F] rounded-xl rounded-tl-sm px-4 py-2.5 inline-block max-w-full">
                      <span className="mr-2">{msg.emoji}</span>
                      <span className="text-sm text-[#D4E4F4] leading-relaxed">{msg.text}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input form */}
          <div className="border-t border-[#1E3A5F] px-5 py-4 bg-[#0D1F35]">
            <AnimatePresence>
              {submitted && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-[#178582] mb-3 font-medium"
                >
                  ✓ Thanks for your feedback!
                </motion.p>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                maxLength={40}
                className="w-full bg-[#112540] border border-[#1E3A5F] rounded-lg px-4 py-2.5 text-sm text-[#E8F0F8] placeholder-[#7A9BBF]/60 focus:outline-none focus:border-[#178582] transition-colors"
              />

              <div className="flex gap-2">
                {/* Emoji picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((v) => !v)}
                    className="w-10 h-10 flex items-center justify-center bg-[#112540] border border-[#1E3A5F] rounded-lg hover:border-[#178582] transition-colors text-lg"
                    aria-label="Pick emoji"
                  >
                    {selectedEmoji}
                  </button>
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute bottom-12 left-0 bg-[#112540] border border-[#1E3A5F] rounded-xl p-2 grid grid-cols-4 gap-1 z-10 shadow-xl"
                      >
                        {EMOJIS.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => { setSelectedEmoji(e); setShowEmojiPicker(false); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1E3A5F] transition-colors text-base"
                          >
                            {e}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Text input */}
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Share your thoughts about WorkNest…"
                  maxLength={200}
                  required
                  className="flex-1 bg-[#112540] border border-[#1E3A5F] rounded-lg px-4 py-2.5 text-sm text-[#E8F0F8] placeholder-[#7A9BBF]/60 focus:outline-none focus:border-[#178582] transition-colors"
                />

                {/* Send */}
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="w-10 h-10 flex items-center justify-center bg-[#178582] hover:bg-[#178582]/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex-shrink-0"
                  aria-label="Send feedback"
                >
                  <Send size={15} className="text-white" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
