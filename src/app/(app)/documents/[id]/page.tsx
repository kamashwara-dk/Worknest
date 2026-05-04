'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Globe, Lock, Tag, X } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { fadeUp } from '@/lib/animations';
import { DocumentEditor } from '@/components/documents/DocumentEditor';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import { use } from 'react';

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const { id } = use(params);
  const utils = trpc.useUtils();

  const { data: doc, isLoading } = trpc.documents.byId.useQuery({ id });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const updateDoc = trpc.documents.update.useMutation({
    onSuccess: () => {
      setLastSaved(new Date());
      setIsDirty(false);
      utils.documents.list.invalidate();
    },
    onError: (err) => toast.error('Auto-save failed: ' + err.message),
  });

  const togglePublic = trpc.documents.togglePublic.useMutation({
    onSuccess: () => utils.documents.byId.invalidate({ id }),
  });

  useEffect(() => {
    if (doc) {
      setTitle(doc.title);
      setContent(doc.content);
      setTags(doc.tags);
    }
  }, [doc]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsDirty(true);

    // Auto-save after 30s of inactivity
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      updateDoc.mutate({ id, content: newContent, title, tags });
    }, 30000);
  }, [id, title, tags, updateDoc]);

  const handleSave = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    updateDoc.mutate({ id, content, title, tags });
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
      setIsDirty(true);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Document not found</p>
        <Link href="/documents" className="text-primary hover:underline mt-2 block">
          Back to documents
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/documents"
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>

        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
          className="flex-1 font-display text-2xl font-bold text-white bg-transparent focus:outline-none border-b border-transparent focus:border-primary transition-colors pb-1"
          placeholder="Document title..."
        />

        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-zinc-600 hidden sm:block">
              Saved {formatRelativeTime(lastSaved)}
            </span>
          )}
          {isDirty && (
            <span className="text-xs text-amber-400 hidden sm:block">Unsaved changes</span>
          )}

          <button
            onClick={() => togglePublic.mutate({ id })}
            className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
            title={doc.isPublic ? 'Make private' : 'Make public'}
          >
            {doc.isPublic ? <Globe size={16} className="text-secondary" /> : <Lock size={16} />}
          </button>

          <button
            onClick={handleSave}
            disabled={updateDoc.isPending}
            className="flex items-center gap-2 shimmer-btn text-white font-semibold px-4 py-2 rounded-lg text-sm hover:shadow-glow-primary transition-all disabled:opacity-50"
          >
            {updateDoc.isPending ? (
              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            <Tag size={10} />
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-white ml-0.5">
              <X size={10} />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="Add tag..."
            className="text-xs px-2 py-1 rounded-full bg-surface border border-border text-zinc-400 focus:outline-none focus:border-primary w-24 transition-colors"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="glass-card rounded-xl overflow-hidden min-h-[600px] flex flex-col">
        <DocumentEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Start writing your document..."
        />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 mt-4 text-xs text-zinc-600">
        <span>Version {doc.version}</span>
        <span>·</span>
        <span>By {doc.author?.name}</span>
        <span>·</span>
        <span>Updated {formatRelativeTime(doc.updatedAt)}</span>
        <span>·</span>
        <span>{doc.isPublic ? '🌐 Public' : '🔒 Private'}</span>
      </div>
    </motion.div>
  );
}
