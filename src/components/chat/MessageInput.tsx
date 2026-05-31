'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useChatStore } from '@/store/useChatStore';
import { toast } from 'sonner';
import type { Message } from '@/types';

interface MessageInputProps {
  channelId?: string | null;
  conversationId?: string | null;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string | null;
}

export function MessageInput({
  channelId,
  conversationId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const threadId = channelId ?? conversationId ?? '';
  const { addMessage, replaceOptimisticMessage, removeMessage } = useChatStore();

  // Build an optimistic message immediately on send
  function buildOptimistic(tempId: string): Message {
    return {
      id: tempId,
      channelId: channelId ?? null,
      conversationId: conversationId ?? null,
      senderId: currentUserId,
      sender: {
        id: currentUserId,
        supabaseId: '',
        email: '',
        name: currentUserName,
        avatar: currentUserAvatar ?? null,
        role: 'EMPLOYEE',
        isActive: true,
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      content,
      type: 'TEXT',
      fileUrl: null,
      createdAt: new Date(),
      editedAt: null,
    };
  }

  const sendChannel = trpc.chat.messages.send.useMutation({
    onMutate: () => {
      const tempId = `optimistic-${Date.now()}`;
      addMessage(threadId, buildOptimistic(tempId));
      return { tempId };
    },
    onSuccess: (real, _vars, ctx) => {
      replaceOptimisticMessage(threadId, ctx!.tempId, real as Message);
    },
    onError: (_err, _vars, ctx) => {
      removeMessage(threadId, ctx!.tempId);
      toast.error('Failed to send message');
    },
  });

  const sendDm = trpc.chat.dm.send.useMutation({
    onMutate: () => {
      const tempId = `optimistic-${Date.now()}`;
      addMessage(threadId, buildOptimistic(tempId));
      return { tempId };
    },
    onSuccess: (real, _vars, ctx) => {
      replaceOptimisticMessage(threadId, ctx!.tempId, real as Message);
    },
    onError: (_err, _vars, ctx) => {
      removeMessage(threadId, ctx!.tempId);
      toast.error('Failed to send message');
    },
  });

  const isPending = sendChannel.isPending || sendDm.isPending;

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || isPending) return;

    setContent('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    if (channelId) {
      sendChannel.mutate({ channelId, content: trimmed, type: 'TEXT' });
    } else if (conversationId) {
      sendDm.mutate({ conversationId, content: trimmed, type: 'TEXT' });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="p-4 border-t border-border bg-surface">
      <div className="flex items-end gap-3 bg-[#112540] rounded-xl border border-border px-3 py-2">
        <button className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0 mb-1" aria-label="Attach file">
          <Paperclip size={18} />
        </button>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-zinc-600 focus:outline-none text-sm resize-none leading-relaxed py-1"
          style={{ minHeight: '24px', maxHeight: '120px' }}
        />
        <button className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0 mb-1" aria-label="Emoji">
          <Smile size={18} />
        </button>
        <button
          onClick={handleSend}
          disabled={!content.trim() || isPending}
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
          aria-label="Send message"
        >
          {isPending ? (
            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>
      <p className="text-xs text-zinc-600 mt-1.5 ml-1">Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
