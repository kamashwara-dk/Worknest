'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { trpc } from '@/lib/trpc/client';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useChatStore } from '@/store/useChatStore';
import type { Message } from '@/types';

interface MessageListProps {
  channelId: string;
  currentUserId: string;
}

export function MessageList({ channelId, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages: storeMessages, setMessages } = useChatStore();

  const { data, isLoading } = trpc.chat.messages.list.useQuery(
    { channelId, limit: 50 },
    { enabled: !!channelId }
  );

  useRealtimeMessages(channelId);

  useEffect(() => {
    if (data?.messages) {
      setMessages(channelId, data.messages as Message[]);
    }
  }, [data, channelId, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storeMessages[channelId]?.length]);

  const messages = storeMessages[channelId] ?? data?.messages ?? [];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Group messages by time proximity (5 min window from same sender)
  const groupedMessages: Array<{ message: Message; showAvatar: boolean }> = [];
  messages.forEach((msg, i) => {
    const prev = messages[i - 1];
    const showAvatar =
      !prev ||
      prev.senderId !== msg.senderId ||
      new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() > 5 * 60 * 1000;

    groupedMessages.push({ message: msg as Message, showAvatar });
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
          No messages yet. Start the conversation!
        </div>
      )}
      {groupedMessages.map(({ message, showAvatar }) => (
        <div key={message.id} className={showAvatar ? 'mt-4' : 'mt-0.5'}>
          <MessageBubble
            message={message}
            isOwn={message.senderId === currentUserId}
            showAvatar={showAvatar}
          />
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
