'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { DMList } from '@/components/chat/DMList';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { useChatStore } from '@/store/useChatStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { usePresence } from '@/hooks/usePresence';
import { trpc } from '@/lib/trpc/client';
import { fadeUp } from '@/lib/animations';

export default function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const { setActiveConversation } = useChatStore();
  const { workspaceId } = useWorkspaceStore();
  const { data: meData } = trpc.users.me.useQuery();
  const { data: conversations } = trpc.chat.dm.conversations.useQuery();

  // Track presence for the whole workspace
  usePresence(workspaceId, meData?.id ?? null);

  const activeConv = conversations?.find((c) => c.id === activeConversationId) ?? null;

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setActiveConversation(conversationId);
    setShowSidebar(false);
  };

  const handleBack = () => {
    setShowSidebar(true);
    setActiveConversationId(null);
  };

  return (
    <motion.div
      variants={fadeUp} initial="hidden" animate="visible"
      className="h-[calc(100vh-7rem)] flex rounded-xl overflow-hidden glass-card border border-border"
    >
      {/* ── DM sidebar ── */}
      <div className={`w-full md:w-64 border-r border-border flex-shrink-0 flex flex-col overflow-hidden ${
        !showSidebar ? 'hidden md:flex' : 'flex'
      }`}>
        {meData && (
          <DMList
            activeConversationId={activeConversationId}
            onConversationSelect={handleConversationSelect}
            currentUserId={meData.id}
          />
        )}
      </div>

      {/* ── Message area ── */}
      <div className={`flex-1 flex flex-col min-w-0 ${showSidebar ? 'hidden md:flex' : 'flex'}`}>
        {activeConversationId && activeConv && meData ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface flex-shrink-0">
              <button
                className="md:hidden text-zinc-400 hover:text-white transition-colors"
                onClick={handleBack}
                aria-label="Back to conversations"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="relative flex-shrink-0">
                <img
                  src={activeConv.other.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConv.other.name)}&background=178582&color=fff&size=32`}
                  alt={activeConv.other.name}
                  className="w-8 h-8 rounded-full"
                />
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-semibold text-white text-sm truncate">
                  {activeConv.other.name}
                </h2>
                <p className="text-xs text-zinc-500">Direct message</p>
              </div>
            </div>

            {/* Messages */}
            <MessageList
              conversationId={activeConversationId}
              currentUserId={meData.id}
            />

            {/* Input */}
            <MessageInput
              conversationId={activeConversationId}
              currentUserId={meData.id}
              currentUserName={meData.name}
              currentUserAvatar={meData.avatar}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-2">
              Your messages
            </h3>
            <p className="text-zinc-500 text-sm max-w-xs">
              Select a conversation or start a new direct message with a team member
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
