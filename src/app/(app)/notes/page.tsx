'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pin, Trash2, Search, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function NotesPage() {
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const utils = trpc.useUtils();
  const { data: notes, isLoading } = trpc.notes.list.useQuery(
    search ? { search } : undefined
  );

  const createMutation = trpc.notes.create.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
      setCreating(false);
      setNewTitle('');
      setNewContent('');
      toast.success('Note created');
    },
  });

  const pinMutation = trpc.notes.pin.useMutation({
    onSuccess: () => utils.notes.list.invalidate(),
  });

  const deleteMutation = trpc.notes.delete.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
      toast.success('Note deleted');
    },
  });

  const pinned = notes?.filter((n) => n.pinned) ?? [];
  const unpinned = notes?.filter((n) => !n.pinned) ?? [];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-[#178582]" />
            <span className="text-xs text-[#7A9BBF] font-medium uppercase tracking-wider">Private</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E8F0F8] font-syne">My Notes</h1>
          <p className="text-[#7A9BBF] text-sm mt-1">Only visible to you</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="self-start sm:self-auto flex items-center gap-2 bg-[#178582] hover:bg-[#178582]/90 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A9BBF]" />
        <input
          type="text"
          placeholder="Search notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0D1F35] border border-[#1E3A5F] rounded-lg pl-10 pr-4 py-2.5 text-[#E8F0F8] placeholder-[#7A9BBF] focus:outline-none focus:border-[#178582] transition-colors"
        />
      </div>

      {/* Create form */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-[#0D1F35] border border-[#178582] rounded-xl p-5 mb-6"
          >
            <input
              type="text"
              placeholder="Note title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-transparent text-[#E8F0F8] text-lg font-semibold placeholder-[#7A9BBF] focus:outline-none mb-3"
              autoFocus
            />
            <textarea
              placeholder="Write something…"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
              className="w-full bg-transparent text-[#E8F0F8] placeholder-[#7A9BBF] focus:outline-none resize-none text-sm"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => createMutation.mutate({ title: newTitle || 'Untitled', content: newContent })}
                disabled={createMutation.isPending}
                className="bg-[#178582] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#178582]/90 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setCreating(false); setNewTitle(''); setNewContent(''); }}
                className="text-[#7A9BBF] hover:text-[#E8F0F8] px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-[#0D1F35] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-[#7A9BBF] font-medium uppercase tracking-wider mb-3 flex items-center gap-1">
                <Pin className="w-3 h-3" /> Pinned
              </p>
              <NoteGrid notes={pinned} onPin={(id) => pinMutation.mutate({ id })} onDelete={(id) => deleteMutation.mutate({ id })} />
            </div>
          )}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <p className="text-xs text-[#7A9BBF] font-medium uppercase tracking-wider mb-3">Other notes</p>
              )}
              <NoteGrid notes={unpinned} onPin={(id) => pinMutation.mutate({ id })} onDelete={(id) => deleteMutation.mutate({ id })} />
            </div>
          )}
          {notes?.length === 0 && (
            <div className="text-center py-20 text-[#7A9BBF]">
              <Lock className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No notes yet</p>
              <p className="text-sm mt-1">Create your first private note</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NoteGrid({ notes, onPin, onDelete }: {
  notes: { id: string; title: string; content: string; pinned: boolean; updatedAt: Date }[];
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <motion.div
          key={note.id}
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="group bg-[#0D1F35] border border-[#1E3A5F] rounded-xl p-5 hover:border-[#178582]/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-[#E8F0F8] truncate">{note.title}</h3>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => onPin(note.id)}
                className={`p-1 rounded hover:bg-[#1E3A5F] transition-colors ${note.pinned ? 'text-[#BFA181]' : 'text-[#7A9BBF]'}`}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="p-1 rounded hover:bg-[#1E3A5F] text-[#7A9BBF] hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-sm text-[#7A9BBF] line-clamp-4 whitespace-pre-wrap">{note.content}</p>
          <p className="text-xs text-[#7A9BBF]/60 mt-3">
            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
