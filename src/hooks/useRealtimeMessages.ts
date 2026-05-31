'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useChatStore } from '@/store/useChatStore';
import type { Message } from '@/types';

interface UseRealtimeOptions {
  channelId?: string | null;
  conversationId?: string | null;
  currentUserId?: string | null;
}

/**
 * Subscribes to Supabase Realtime for a single channel OR conversation.
 * Strictly scoped — only one subscription per hook instance, no payload bloat.
 */
export function useRealtimeMessages({
  channelId,
  conversationId,
  currentUserId,
}: UseRealtimeOptions) {
  const { addMessage, activeChannelId, activeConversationId, incrementUnread, incrementDmUnread } =
    useChatStore();

  useEffect(() => {
    const threadId = channelId ?? conversationId;
    if (!threadId) return;

    const supabase = createClient();
    const isChannel = !!channelId;

    // Strictly scope the filter to prevent receiving other threads' messages
    const filter = isChannel
      ? `channelId=eq.${channelId}`
      : `conversationId=eq.${conversationId}`;

    const realtimeChannel = supabase
      .channel(`messages:${threadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Message', filter },
        (payload) => {
          const msg = payload.new as Message;

          // Skip messages sent by the current user — they're already in the store
          // via optimistic update; the server confirmation comes through tRPC
          if (msg.senderId === currentUserId) return;

          addMessage(threadId, msg);

          // Increment unread if this thread isn't currently active
          const isActive = isChannel
            ? activeChannelId === channelId
            : activeConversationId === conversationId;

          if (!isActive) {
            if (isChannel) incrementUnread(threadId);
            else incrementDmUnread(threadId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [
    channelId,
    conversationId,
    currentUserId,
    activeChannelId,
    activeConversationId,
    addMessage,
    incrementUnread,
    incrementDmUnread,
  ]);
}
