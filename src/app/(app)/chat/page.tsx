'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, ArrowLeft } from 'lucide-react';
import { ChannelList } from '@/components/chat/ChannelList';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { useChatStore } from '@/store/useChatStore';
import { trpc } from '@/lib/trpc/client';
import { fadeUp } from '@/lib/animations';

export default function ChatPage() {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [showChannelList, setShowChannelList] = useState(true);
  const { setActiveChannel } = useChatStore();
  const { data: meData } = trpc.users.me.useQuery();
  const { data: channels } = trpc.chat.channels.list.useQuery();

  const activeChannel = channels?.find((c) => c.id === activeChannelId);

  const handleChannelSelect = (channelId: string) => {
    setActiveChannelId(channelId);
    setActiveChannel(channelId);
    setShowChannelList(false); // mobile: hide channel list
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-7rem)] flex rounded-xl overflow-hidden glass-card border border-border"
    >
      {/* Channel list - hidden on mobile when channel selected */}
      <div className={`w-full md:w-64 border-r border-border flex-shrink-0 ${
        !showChannelList ? 'hidden md:flex md:flex-col' : 'flex flex-col'
      }`}>
        <ChannelList
          activeChannelId={activeChannelId}
          onChannelSelect={handleChannelSelect}
        />
      </div>

      {/* Message area */}
      <div className={`flex-1 flex flex-col ${
        showChannelList ? 'hidden md:flex' : 'flex'
      }`}>
        {activeChannelId && activeChannel ? (
          <>
            {/* Channel header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface">
              <button
                className="md:hidden text-zinc-400 hover:text-white transition-colors"
                onClick={() => setShowChannelList(true)}
                aria-label="Back to channels"
              >
                <ArrowLeft size={18} />
              </button>
              <Hash size={16} className="text-zinc-400" />
              <div>
                <h2 className="font-display font-semibold text-white text-sm">{activeChannel.name}</h2>
                {activeChannel.description && (
                  <p className="text-xs text-zinc-500">{activeChannel.description}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            {meData && (
              <MessageList
                channelId={activeChannelId}
                currentUserId={meData.id}
              />
            )}

            {/* Input */}
            <MessageInput channelId={activeChannelId} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Hash size={28} className="text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-2">
              Select a channel
            </h3>
            <p className="text-zinc-500 text-sm">
              Choose a channel from the left to start messaging
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
