'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useChatStore } from '@/store/useChatStore';

/**
 * Tracks online presence for workspace members using Supabase Presence.
 * Call once at the workspace layout level.
 */
export function usePresence(workspaceId: string | null, userId: string | null) {
  const setOnlineUsers = useChatStore((s) => s.setOnlineUsers);

  useEffect(() => {
    if (!workspaceId || !userId) return;

    const supabase = createClient();

    const channel = supabase.channel(`presence:${workspaceId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ userId: string }>();
        const onlineIds = Object.values(state)
          .flat()
          .map((p) => p.userId)
          .filter(Boolean);
        setOnlineUsers(onlineIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userId });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [workspaceId, userId, setOnlineUsers]);
}
