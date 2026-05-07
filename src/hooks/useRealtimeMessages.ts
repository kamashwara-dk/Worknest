'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useChatStore } from '@/store/useChatStore';
import type { Message } from '@/types';

export function useRealtimeMessages(channelId: string | null) {
  const { addMessage, activeChannelId, incrementUnread } = useChatStore();

  useEffect(() => {
    if (!channelId) return;

    const supabase = createClient();

    const subscription = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `channelId=eq.${channelId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          addMessage(channelId, newMessage);

          if (activeChannelId !== channelId) {
            incrementUnread(channelId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [channelId, activeChannelId, addMessage, incrementUnread]);
}
