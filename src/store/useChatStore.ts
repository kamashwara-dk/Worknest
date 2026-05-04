import { create } from 'zustand';
import type { Message } from '@/types';

interface ChatState {
  activeChannelId: string | null;
  unreadCounts: Record<string, number>;
  messages: Record<string, Message[]>;
  setActiveChannel: (channelId: string | null) => void;
  incrementUnread: (channelId: string) => void;
  clearUnread: (channelId: string) => void;
  addMessage: (channelId: string, message: Message) => void;
  setMessages: (channelId: string, messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChannelId: null,
  unreadCounts: {},
  messages: {},
  setActiveChannel: (channelId) =>
    set((state) => ({
      activeChannelId: channelId,
      unreadCounts: channelId
        ? { ...state.unreadCounts, [channelId]: 0 }
        : state.unreadCounts,
    })),
  incrementUnread: (channelId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [channelId]: (state.unreadCounts[channelId] ?? 0) + 1,
      },
    })),
  clearUnread: (channelId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [channelId]: 0 },
    })),
  addMessage: (channelId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] ?? []), message],
      },
    })),
  setMessages: (channelId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [channelId]: messages },
    })),
}));
