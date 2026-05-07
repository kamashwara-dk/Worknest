'use client';

import { Hash, Lock, Plus } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useChatStore } from '@/store/useChatStore';
import { cn } from '@/lib/utils';

interface ChannelListProps {
  activeChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
}

export function ChannelList({ activeChannelId, onChannelSelect }: ChannelListProps) {
  const { data: channels, isLoading } = trpc.chat.channels.list.useQuery();
  const { unreadCounts } = useChatStore();

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-[#112540] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-display font-semibold text-white text-sm">Channels</h2>
        <button
          className="text-zinc-400 hover:text-white transition-colors"
          aria-label="Create channel"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {channels?.map((channel) => {
          const unread = unreadCounts[channel.id] ?? 0;
          const isActive = activeChannelId === channel.id;

          return (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel.id)}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors text-left',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              )}
            >
              {channel.isPrivate ? (
                <Lock size={14} className="flex-shrink-0" />
              ) : (
                <Hash size={14} className="flex-shrink-0" />
              )}
              <span className="flex-1 truncate">{channel.name}</span>
              {unread > 0 && (
                <span className="min-w-[18px] h-[18px] rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
