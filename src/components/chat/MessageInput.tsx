'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

interface MessageInputProps {
  channelId: string;
  onMessageSent?: () => void;
}

export function MessageInput({ channelId, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = trpc.chat.messages.send.useMutation({
    onSuccess: () => {
      setContent('');
      onMessageSent?.();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || sendMessage.isPending) return;

    sendMessage.mutate({
      channelId,
      content: trimmed,
      type: 'TEXT',
    });
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
        <button
          className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0 mb-1"
          aria-label="Attach file"
        >
          <Paperclip size={18} />
        </button>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-zinc-600 focus:outline-none text-sm resize-none leading-relaxed py-1"
          style={{ minHeight: '24px', maxHeight: '120px' }}
        />

        <button
          className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0 mb-1"
          aria-label="Emoji"
        >
          <Smile size={18} />
        </button>

        <button
          onClick={handleSend}
          disabled={!content.trim() || sendMessage.isPending}
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
          aria-label="Send message"
        >
          {sendMessage.isPending ? (
            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>
      <p className="text-xs text-zinc-600 mt-1.5 ml-1">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
