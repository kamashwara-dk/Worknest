'use client';

import { useState } from 'react';
import { Plus, Search, X, MessageCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useChatStore } from '@/store/useChatStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DMListProps {
  activeConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  currentUserId: string;
}

export function DMList({ activeConversationId, onConversationSelect, currentUserId }: DMListProps) {
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { dmUnreadCounts, onlineUserIds } = useChatStore();

  const { data: conversations, isLoading } = trpc.chat.dm.conversations.useQuery();
  const { data: members } = trpc.users.list.useQuery();
  const utils = trpc.useUtils();

  const getOrCreate = trpc.chat.dm.getOrCreate.useMutation({
    onSuccess: (conv) => {
      utils.chat.dm.conversations.invalidate();
      onConversationSelect(conv.id);
      setNewChatOpen(false);
      setSearch('');
    },
  });

  const filteredMembers = members?.filter(
    (m) =>
      m.id !== currentUserId &&
      m.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="flex flex-col">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <h2 className="font-display font-semibold text-white text-sm flex items-center gap-1.5">
          <MessageCircle size={14} className="text-zinc-400" />
          Direct Messages
        </h2>
        <button
          onClick={() => setNewChatOpen(true)}
          className="text-zinc-400 hover:text-white transition-colors"
          aria-label="New direct message"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Conversation list */}
      <div className="py-1">
        {isLoading ? (
          <div className="px-4 py-2 space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-8 bg-[#112540] rounded-lg animate-pulse" />)}
          </div>
        ) : conversations?.length === 0 ? (
          <p className="text-xs text-zinc-600 px-4 py-2">No conversations yet</p>
        ) : (
          conversations?.map((conv) => {
            const isActive = activeConversationId === conv.id;
            const unread = dmUnreadCounts[conv.id] ?? 0;
            const isOnline = onlineUserIds.has(conv.other.id);

            return (
              <button
                key={conv.id}
                onClick={() => onConversationSelect(conv.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors text-left',
                  isActive ? 'bg-primary/10 text-primary' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                )}
              >
                {/* Avatar with presence dot */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conv.other.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.other.name)}&background=178582&color=fff&size=28`}
                    alt={conv.other.name}
                    className="w-7 h-7 rounded-full"
                  />
                  <span className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0D1F35]',
                    isOnline ? 'bg-green-400' : 'bg-zinc-600'
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-sm">{conv.other.name}</p>
                  {conv.lastMessage && (
                    <p className="text-xs text-zinc-600 truncate">
                      {conv.lastMessage.content}
                    </p>
                  )}
                </div>

                {unread > 0 && (
                  <span className="min-w-[18px] h-[18px] rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium flex-shrink-0">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* New chat modal */}
      <AnimatePresence>
        {newChatOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setNewChatOpen(false); setSearch(''); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#0D1F35] border border-[#1E3A5F] rounded-2xl overflow-hidden z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E3A5F]">
                <h3 className="font-semibold text-[#E8F0F8] text-sm">New Direct Message</h3>
                <button onClick={() => { setNewChatOpen(false); setSearch(''); }} className="text-[#7A9BBF] hover:text-[#E8F0F8]">
                  <X size={16} />
                </button>
              </div>

              {/* Search */}
              <div className="px-4 py-3 border-b border-[#1E3A5F]">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A9BBF]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search members…"
                    autoFocus
                    className="w-full bg-[#112540] border border-[#1E3A5F] rounded-lg pl-8 pr-3 py-2 text-sm text-[#E8F0F8] placeholder-[#7A9BBF]/60 focus:outline-none focus:border-[#178582] transition-colors"
                  />
                </div>
              </div>

              {/* Member list */}
              <div className="max-h-64 overflow-y-auto">
                {filteredMembers.length === 0 ? (
                  <p className="text-center text-[#7A9BBF] text-sm py-6">No members found</p>
                ) : (
                  filteredMembers.map((member) => {
                    const isOnline = onlineUserIds.has(member.id);
                    return (
                      <button
                        key={member.id}
                        onClick={() => getOrCreate.mutate({ otherUserId: member.id })}
                        disabled={getOrCreate.isPending}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#112540] transition-colors text-left disabled:opacity-50"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={member.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=178582&color=fff&size=32`}
                            alt={member.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className={cn(
                            'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0D1F35]',
                            isOnline ? 'bg-green-400' : 'bg-zinc-600'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#E8F0F8] truncate">{member.name}</p>
                          <p className="text-xs text-[#7A9BBF] truncate">{member.designation ?? member.email}</p>
                        </div>
                        <span className={cn('text-xs', isOnline ? 'text-green-400' : 'text-zinc-600')}>
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
