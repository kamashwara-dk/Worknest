'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, ArrowLeft, MessageCircle, Lock } from 'lucide-react';
import { ChannelList } from '@/components/chat/ChannelList';
import { DMList } from '@/components/chat/DMList';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { useChatStore } from '@/store/useChatStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { usePresence } from '@/hooks/usePresence';
import { trpc } from '@/lib/trpc/client';
import { fadeUp } from '@/lib/animations';

type ActiveThread =
  | { type: 'channel'; id: string }
  | { type: 'dm'; id: string }
  | null;

export default function ChatPage() {
  const [activeThread, setActiveThread] = useState<ActiveThread>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const { setActiveChannel, setActiveConversation } = useChatStore();
  const { workspaceId } = useWorkspaceStore();
  const { data: meData } = trpc.users.me.useQuery();
  const { data: channels } = trpc.chat.channels.list.useQuery();
  const { data: conversations } = trpc.chat.dm.conversations.useQuery();

  // Track presence for the whole workspace
  usePresence(workspaceId, meData?.id ?? null);

  const activeChannel = activeThread?.type === 'channel'
    ? channels?.find((c) => c.id === activeThread.id)
    : null;

  const activeConv = activeThread?.type === 'dm'
    ? conversations?.find((c) => c.id === activeThread.id)
    : null;

  const handleChannelSelect = (channelId: string) => {
    setActiveThread({ type: 'channel', id: channelId });
    setActiveChannel(channelId);
    setShowSidebar(false);
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveThread({ type: 'dm', id: conversationId });
    setActiveConversation(conversationId);
    setShowSidebar(false);
  };

  const handleBack = () => {
    setShowSidebar(true);
    setActiveThread(null);
  };

  return (
    <motion.div
      variants={fadeUp} initial="hidden" animate="visible"
      className="h-[calc(100vh-7rem)] flex rounded-xl overflow-hidden glass-card border border-border"
    >
      {/* ── Sidebar ── */}
      <div className={`w-full md:w-64 border-r border-border flex-shrink-0 flex flex-col overflow-hidden ${
        !showSidebar ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Channels */}
        <div className="flex-shrink-0">
          <ChannelList
            activeChannelId={activeThread?.type === 'channel' ? activeThread.id : null}
            onChannelSelect={handleChannelSelect}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* DMs */}
        {meData && (
          <div className="flex-1 overflow-y-auto">
            <DMList
              activeConversationId={activeThread?.type === 'dm' ? activeThread.id : null}
              onConversationSelect={handleConversationSelect}
              currentUserId={meData.id}
            />
          </div>
        )}
      </div>

      {/* ── Message area ── */}
      <div className={`flex-1 flex flex-col min-w-0 ${showSidebar ? 'hidden md:flex' : 'flex'}`}>
        {activeThread && meData ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface flex-shrink-0">
              <button
                className="md:hidden text-zinc-400 hover:text-white transition-colors"
                onClick={handleBack}
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>

              {activeThread.type === 'channel' && activeChannel && (
                <>
                  {activeChannel.isPrivate
                    ? <Lock size={15} className="text-zinc-400 flex-shrink-0" />
                    : <Hash size={15} className="text-zinc-400 flex-shrink-0" />}
                  <div className="min-w-0">
                    <h2 className="font-display font-semibold text-white text-sm truncate">{activeChannel.name}</h2>
                    {activeChannel.description && (
                      <p className="text-xs text-zinc-500 truncate">{activeChannel.description}</p>
                    )}
                  </div>
                </>
              )}

              {activeThread.type === 'dm' && activeConv && (
                <>
                  <div className="relative flex-shrink-0">
                    <img
                      src={activeConv.other.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConv.other.name)}&background=178582&color=fff&size=32`}
                      alt={activeConv.other.name}
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display font-semibold text-white text-sm truncate">{activeConv.other.name}</h2>
                    <p className="text-xs text-zinc-500">Direct message</p>
                  </div>
                </>
              )}
            </div>

            {/* Messages */}
            <MessageList
              channelId={activeThread.type === 'channel' ? activeThread.id : null}
              conversationId={activeThread.type === 'dm' ? activeThread.id : null}
              currentUserId={meData.id}
            />

            {/* Input */}
            <MessageInput
              channelId={activeThread.type === 'channel' ? activeThread.id : null}
              conversationId={activeThread.type === 'dm' ? activeThread.id : null}
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
              Select a conversation
            </h3>
            <p className="text-zinc-500 text-sm max-w-xs">
              Choose a channel or start a direct message with a team member
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
