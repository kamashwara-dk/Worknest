'use client';

import { motion } from 'framer-motion';
import { formatTime } from '@/lib/utils';
import { slideRight } from '@/lib/animations';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  return (
    <motion.div
      variants={slideRight}
      initial="hidden"
      animate="visible"
      className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className="w-7 h-7 flex-shrink-0">
        {showAvatar && !isOwn && (
          <img
            src={message.sender?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender?.name ?? 'U')}&background=178582&color=fff&size=28`}
            alt={message.sender?.name}
            className="w-7 h-7 rounded-full"
          />
        )}
      </div>

      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Sender name */}
        {showAvatar && !isOwn && (
          <span className="text-xs text-zinc-500 mb-1 ml-1">{message.sender?.name}</span>
        )}

        {/* Message bubble */}
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? 'bg-primary text-white rounded-br-sm'
              : 'bg-[#112540] text-zinc-200 rounded-bl-sm border border-border'
          }`}
        >
          {message.type === 'FILE' && message.fileUrl ? (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm underline"
            >
              📎 {message.content}
            </a>
          ) : message.type === 'IMAGE' && message.fileUrl ? (
            <img
              src={message.fileUrl}
              alt="Shared image"
              className="max-w-full rounded-lg"
            />
          ) : (
            <span>{message.content}</span>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-zinc-600 mt-1 mx-1">
          {formatTime(message.createdAt)}
          {message.editedAt && <span className="ml-1">(edited)</span>}
        </span>
      </div>
    </motion.div>
  );
}
