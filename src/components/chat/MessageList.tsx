'use client';

import { useEffect, useRef, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { trpc } from '@/lib/trpc/client';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useChatStore } from '@/store/useChatStore';
import type { Message } from '@/types';

interface MessageListProps {
  channelId?: string | null;
  conversationId?: string | null;
  currentUserId: string;
}

export function MessageList({ channelId, conversationId, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const threadId = channelId ?? conversationId ?? '';
  const { messages: storeMessages, setMessages } = useChatStore();

  // ── Channel messages (infinite scroll) ──────────────────────────────────
  const channelQuery = trpc.chat.messages.list.useInfiniteQuery(
    { channelId: channelId!, limit: 50 },
    {
      enabled: !!channelId,
      getNextPageParam: (page) => page.nextCursor,
      initialCursor: undefined,
    }
  );

  // ── DM messages (infinite scroll) ────────────────────────────────────────
  const dmQuery = trpc.chat.dm.messages.useInfiniteQuery(
    { conversationId: conversationId!, limit: 50 },
    {
      enabled: !!conversationId,
      getNextPageParam: (page) => page.nextCursor,
      initialCursor: undefined,
    }
  );

  const activeQuery = channelId ? channelQuery : dmQuery;
  const isLoading = activeQuery.isLoading;
  const isFetchingMore = activeQuery.isFetchingNextPage;

  // Flatten pages into a single message array
  const pagedMessages: Message[] = (activeQuery.data?.pages ?? [])
    .flatMap((p) => p.messages as Message[])
    .reverse(); // pages come newest-first, reverse to oldest-first

  // Seed the store once on load
  useEffect(() => {
    if (pagedMessages.length > 0) {
      setMessages(threadId, pagedMessages);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuery.data]);

  // Realtime subscription — strictly scoped
  useRealtimeMessages({ channelId, conversationId, currentUserId });

  // Scroll to bottom on new messages
  const messages = storeMessages[threadId] ?? pagedMessages;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Infinite scroll — load older messages when scrolling to top
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (e.currentTarget.scrollTop < 80 && activeQuery.hasNextPage && !isFetchingMore) {
        activeQuery.fetchNextPage();
      }
    },
    [activeQuery, isFetchingMore]
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Group messages: show avatar only when sender changes or >5 min gap
  const grouped: Array<{ message: Message; showAvatar: boolean }> = [];
  messages.forEach((msg, i) => {
    const prev = messages[i - 1];
    const showAvatar =
      !prev ||
      prev.senderId !== msg.senderId ||
      new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() > 5 * 60 * 1000;
    grouped.push({ message: msg, showAvatar });
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1" onScroll={handleScroll}>
      {/* Load more indicator */}
      <div ref={topRef} />
      {isFetchingMore && (
        <div className="flex justify-center py-2">
          <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
          No messages yet. Start the conversation!
        </div>
      )}

      {grouped.map(({ message, showAvatar }) => (
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
