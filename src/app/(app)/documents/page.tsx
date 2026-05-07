'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, FileText, Globe, Lock, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { fadeUp, staggerContainer, modalVariants, backdropVariants } from '@/lib/animations';
import { formatRelativeTime } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(false);

  const utils = trpc.useUtils();
  const { data: documents, isLoading } = trpc.documents.list.useQuery({
    search: search || undefined,
  });

  const createDoc = trpc.documents.create.useMutation({
    onSuccess: () => {
      toast.success('Document created!');
      utils.documents.list.invalidate();
      setCreateModalOpen(false);
      setNewTitle('');
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteDoc = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success('Document deleted');
      utils.documents.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const togglePublic = trpc.documents.togglePublic.useMutation({
    onSuccess: () => utils.documents.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Documents</h1>
          <p className="text-zinc-400 text-sm mt-1">{documents?.length ?? 0} documents</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 shimmer-btn text-white font-semibold px-4 py-2 rounded-lg text-sm hover:shadow-glow-primary transition-all"
        >
          <Plus size={16} />
          New Document
        </button>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full pl-8 pr-3 py-2 rounded-lg bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary text-sm transition-colors"
        />
      </motion.div>

      {/* Document grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {documents?.map((doc) => (
            <motion.div
              key={doc.id}
              variants={fadeUp}
              whileHover={{ y: -2 }}
              className="glass-card rounded-xl p-4 group hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText size={18} className="text-primary" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => togglePublic.mutate({ id: doc.id })}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                    title={doc.isPublic ? 'Make private' : 'Make public'}
                  >
                    {doc.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this document?')) {
                        deleteDoc.mutate({ id: doc.id });
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <Link href={`/documents/${doc.id}`}>
                <h3 className="font-display font-semibold text-white text-sm mb-1 hover:text-primary transition-colors line-clamp-2">
                  {doc.title}
                </h3>
              </Link>

              <div className="flex flex-wrap gap-1 mb-3">
                {doc.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary/80">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <img
                    src={doc.author?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.author?.name ?? 'U')}&background=178582&color=fff&size=20`}
                    alt={doc.author?.name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-xs text-zinc-500">{doc.author?.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {doc.isPublic ? (
                    <Globe size={11} className="text-secondary" />
                  ) : (
                    <Lock size={11} className="text-zinc-600" />
                  )}
                  <span className="text-xs text-zinc-600">{formatRelativeTime(doc.updatedAt)}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {documents?.length === 0 && (
            <div className="col-span-full text-center py-12 text-zinc-600">
              No documents yet. Create your first document!
            </div>
          )}
        </motion.div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setCreateModalOpen(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-sm glass-card rounded-2xl p-6 z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">New Document</h2>
                <button onClick={() => setCreateModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Document title..."
                    className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary text-sm"
                    autoFocus
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newIsPublic}
                    onChange={(e) => setNewIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded border-border bg-surface text-primary"
                  />
                  <label htmlFor="isPublic" className="text-sm text-zinc-300">
                    Make public (visible to all team members)
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setCreateModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!newTitle.trim()) {
                        toast.error('Please enter a title');
                        return;
                      }
                      createDoc.mutate({ title: newTitle, isPublic: newIsPublic });
                    }}
                    disabled={createDoc.isPending}
                    className="flex-1 shimmer-btn text-white font-semibold py-2.5 rounded-lg transition-all hover:shadow-glow-primary disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {createDoc.isPending ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : null}
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
