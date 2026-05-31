import { create } from 'zustand';
import type { Message } from '@/types';

interface ChatState {
  // Channels
  activeChannelId: string | null;
  unreadCounts: Record<string, number>;

  // DMs
  activeConversationId: string | null;
  dmUnreadCounts: Record<string, number>;

  // Shared message cache keyed by channelId or conversationId
  messages: Record<string, Message[]>;

  // Online presence: set of user IDs currently online
  onlineUserIds: Set<string>;

  setActiveChannel: (channelId: string | null) => void;
  setActiveConversation: (conversationId: string | null) => void;
  incrementUnread: (id: string) => void;
  clearUnread: (id: string) => void;
  incrementDmUnread: (id: string) => void;
  clearDmUnread: (id: string) => void;
  addMessage: (threadId: string, message: Message) => void;
  setMessages: (threadId: string, messages: Message[]) => void;
  replaceOptimisticMessage: (threadId: string, tempId: string, real: Message) => void;
  removeMessage: (threadId: string, id: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChannelId: null,
  activeConversationId: null,
  unreadCounts: {},
  dmUnreadCounts: {},
  messages: {},
  onlineUserIds: new Set(),

  setActiveChannel: (channelId) =>
    set((s) => ({
      activeChannelId: channelId,
      activeConversationId: null,
      unreadCounts: channelId ? { ...s.unreadCounts, [channelId]: 0 } : s.unreadCounts,
    })),

  setActiveConversation: (conversationId) =>
    set((s) => ({
      activeConversationId: conversationId,
      activeChannelId: null,
      dmUnreadCounts: conversationId
        ? { ...s.dmUnreadCounts, [conversationId]: 0 }
        : s.dmUnreadCounts,
    })),

  incrementUnread: (id) =>
    set((s) => ({ unreadCounts: { ...s.unreadCounts, [id]: (s.unreadCounts[id] ?? 0) + 1 } })),

  clearUnread: (id) =>
    set((s) => ({ unreadCounts: { ...s.unreadCounts, [id]: 0 } })),

  incrementDmUnread: (id) =>
    set((s) => ({ dmUnreadCounts: { ...s.dmUnreadCounts, [id]: (s.dmUnreadCounts[id] ?? 0) + 1 } })),

  clearDmUnread: (id) =>
    set((s) => ({ dmUnreadCounts: { ...s.dmUnreadCounts, [id]: 0 } })),

  addMessage: (threadId, message) =>
    set((s) => {
      const existing = s.messages[threadId] ?? [];
      // Deduplicate by id
      if (existing.some((m) => m.id === message.id)) return s;
      return { messages: { ...s.messages, [threadId]: [...existing, message] } };
    }),

  setMessages: (threadId, messages) =>
    set((s) => ({ messages: { ...s.messages, [threadId]: messages } })),

  // Replace a temp optimistic message with the real server response
  replaceOptimisticMessage: (threadId, tempId, real) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [threadId]: (s.messages[threadId] ?? []).map((m) => (m.id === tempId ? real : m)),
      },
    })),

  // Remove a message (used to roll back failed optimistic updates)
  removeMessage: (threadId, id) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [threadId]: (s.messages[threadId] ?? []).filter((m) => m.id !== id),
      },
    })),

  setOnlineUsers: (userIds) =>
    set(() => ({ onlineUserIds: new Set(userIds) })),
}));
