'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { motion } from 'framer-motion';
import {
  Hash, Link2, Copy, RefreshCw, Plus, Trash2, ToggleLeft,
  ToggleRight, Check, ExternalLink, Shield, Clock, Users,
  ChevronDown, ChevronUp, Loader2, LogOut, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// ─── helpers ─────────────────────────────────────────────────────────────────

function copyToClipboard(text: string, label = 'Copied') {
  navigator.clipboard.writeText(text).then(() => toast.success(label));
}

const APP_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL ?? 'https://worknest-ai.vercel.app';

// ─── page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { workspaceRole, workspaceName, clearWorkspace } = useWorkspaceStore();
  const isManager = workspaceRole === 'MANAGER' || workspaceRole === 'ADMIN' || workspaceRole === 'OWNER';
  const isAdmin   = workspaceRole === 'ADMIN'   || workspaceRole === 'OWNER';
  const isOwner   = workspaceRole === 'OWNER';

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#E8F0F8] font-syne">Workspace Settings</h1>
        <p className="text-[#7A9BBF] text-sm mt-1">Manage how people join your workspace</p>
      </div>

      {/* Join code — visible to all members so they can share it */}
      <JoinCodeSection isAdmin={isAdmin} isManager={isManager} />

      {/* Invite links — managers+ only */}
      {isManager && <InviteLinksSection isAdmin={isAdmin} />}

      {/* Leave workspace — all non-owners */}
      {!isOwner && <LeaveWorkspaceSection workspaceName={workspaceName ?? 'this workspace'} onLeft={clearWorkspace} />}
    </div>
  );
}

// ─── Join Code section ────────────────────────────────────────────────────────

function JoinCodeSection({ isAdmin, isManager }: { isAdmin: boolean; isManager: boolean }) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.workspaces.getJoinCode.useQuery();

  const regenerate = trpc.workspaces.regenerateJoinCode.useMutation({
    onSuccess: () => { utils.workspaces.getJoinCode.invalidate(); toast.success('Join code regenerated'); },
    onError: (e) => toast.error(e.message),
  });

  const toggle = trpc.workspaces.toggleJoinCode.useMutation({
    onSuccess: (d) => { utils.workspaces.getJoinCode.invalidate(); toast.success(d.joinCodeEnabled ? 'Join code enabled' : 'Join code disabled'); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <section className="bg-[#0D1F35] border border-[#1E3A5F] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1E3A5F]">
        <div className="w-9 h-9 rounded-lg bg-[#178582]/20 flex items-center justify-center shrink-0">
          <Hash className="w-4 h-4 text-[#178582]" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[#E8F0F8]">Workspace Join Code</p>
          <p className="text-xs text-[#7A9BBF]">Share this short code so anyone can join without an invite link</p>
        </div>
        {isAdmin && data && (
          <button
            onClick={() => toggle.mutate()}
            disabled={toggle.isPending}
            className="flex items-center gap-1.5 text-xs text-[#7A9BBF] hover:text-[#E8F0F8] transition-colors"
            title={data.joinCodeEnabled ? 'Disable join code' : 'Enable join code'}
          >
            {toggle.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : data.joinCodeEnabled
                ? <ToggleRight className="w-5 h-5 text-[#178582]" />
                : <ToggleLeft className="w-5 h-5" />}
            <span>{data.joinCodeEnabled ? 'Enabled' : 'Disabled'}</span>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        {isLoading ? (
          <div className="h-14 bg-[#112540] rounded-lg animate-pulse" />
        ) : data ? (
          <>
            {/* Code display */}
            <div className={`flex items-center gap-3 bg-[#112540] border rounded-xl px-5 py-4 transition-colors ${data.joinCodeEnabled ? 'border-[#1E3A5F]' : 'border-[#1E3A5F] opacity-50'}`}>
              <span className={`font-mono text-3xl font-bold tracking-[0.25em] flex-1 select-all ${data.joinCodeEnabled ? 'text-[#BFA181]' : 'text-[#7A9BBF]'}`}>
                {data.joinCode}
              </span>
              <button
                onClick={() => copyToClipboard(data.joinCode, 'Join code copied')}
                disabled={!data.joinCodeEnabled}
                className="p-2 rounded-lg hover:bg-[#1E3A5F] text-[#7A9BBF] hover:text-[#E8F0F8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Status + actions */}
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-[#7A9BBF]">
                {data.joinCodeEnabled
                  ? 'Anyone with this code can join as a Member'
                  : 'Join code is disabled — no one can join with it'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => regenerate.mutate()}
                  disabled={regenerate.isPending}
                  className="flex items-center gap-1.5 text-xs text-[#7A9BBF] hover:text-[#178582] transition-colors"
                >
                  {regenerate.isPending
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <RefreshCw className="w-3 h-3" />}
                  Regenerate
                </button>
              )}
            </div>

            {/* How to use */}
            <div className="mt-4 bg-[#112540] rounded-lg px-4 py-3 text-xs text-[#7A9BBF] space-y-1">
              <p className="font-medium text-[#E8F0F8]">How to share:</p>
              <p>1. Copy the code above and send it to your team member</p>
              <p>2. They go to <span className="text-[#178582]">{APP_URL}/workspaces</span> → "Join a Workspace" tab</p>
              <p>3. They type the code and click Join</p>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

// ─── Invite Links section ─────────────────────────────────────────────────────

function InviteLinksSection({ isAdmin }: { isAdmin: boolean }) {
  const utils = trpc.useUtils();
  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: links, isLoading } = trpc.workspaces.inviteLinks.list.useQuery();

  const create = trpc.workspaces.inviteLinks.create.useMutation({
    onSuccess: () => {
      utils.workspaces.inviteLinks.list.invalidate();
      setShowCreate(false);
      setLabel(''); setMaxUses(''); setExpiresInDays('');
      toast.success('Invite link created');
    },
    onError: (e) => toast.error(e.message),
  });

  const deactivate = trpc.workspaces.inviteLinks.deactivate.useMutation({
    onSuccess: () => { utils.workspaces.inviteLinks.list.invalidate(); toast.success('Link deactivated'); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.workspaces.inviteLinks.delete.useMutation({
    onSuccess: () => { utils.workspaces.inviteLinks.list.invalidate(); toast.success('Link deleted'); },
    onError: (e) => toast.error(e.message),
  });

  function handleCopy(token: string, id: string) {
    const url = `${APP_URL}/invite/${token}`;
    copyToClipboard(url, 'Invite link copied');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      label: label.trim() || undefined,
      maxUses: maxUses ? parseInt(maxUses) : undefined,
      expiresInDays: expiresInDays ? parseInt(expiresInDays) : undefined,
    });
  }

  const activeLinks   = links?.filter((l) => l.isActive) ?? [];
  const inactiveLinks = links?.filter((l) => !l.isActive) ?? [];

  return (
    <section className="bg-[#0D1F35] border border-[#1E3A5F] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1E3A5F]">
        <div className="w-9 h-9 rounded-lg bg-[#BFA181]/20 flex items-center justify-center shrink-0">
          <Link2 className="w-4 h-4 text-[#BFA181]" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[#E8F0F8]">Invite Links</p>
          <p className="text-xs text-[#7A9BBF]">Shareable URLs — anyone with the link can join</p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-1.5 text-xs bg-[#178582] hover:bg-[#178582]/90 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          New Link
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-[#1E3A5F] px-6 py-5 bg-[#112540]"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-[#7A9BBF] mb-1.5">
                  Label <span className="text-[#7A9BBF]/60">(optional)</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Engineering team, Q3 hiring"
                  maxLength={80}
                  className="w-full bg-[#0D1F35] border border-[#1E3A5F] rounded-lg px-3 py-2 text-sm text-[#E8F0F8] placeholder-[#7A9BBF]/60 focus:outline-none focus:border-[#178582] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7A9BBF] mb-1.5 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Max uses
                </label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Unlimited"
                  min={1}
                  className="w-full bg-[#0D1F35] border border-[#1E3A5F] rounded-lg px-3 py-2 text-sm text-[#E8F0F8] placeholder-[#7A9BBF]/60 focus:outline-none focus:border-[#178582] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7A9BBF] mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Expires in (days)
                </label>
                <input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  placeholder="Never"
                  min={1}
                  max={365}
                  className="w-full bg-[#0D1F35] border border-[#1E3A5F] rounded-lg px-3 py-2 text-sm text-[#E8F0F8] placeholder-[#7A9BBF]/60 focus:outline-none focus:border-[#178582] transition-colors"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={create.isPending}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#178582] hover:bg-[#178582]/90 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Links list */}
      <div className="px-6 py-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-16 bg-[#112540] rounded-lg animate-pulse" />)}
          </div>
        ) : activeLinks.length === 0 && inactiveLinks.length === 0 ? (
          <div className="text-center py-8 text-[#7A9BBF]">
            <Link2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No invite links yet</p>
            <p className="text-xs mt-1">Click "New Link" to create one</p>
          </div>
        ) : (
          <>
            {/* Active links */}
            {activeLinks.map((link) => (
              <LinkRow
                key={link.id}
                link={link}
                copiedId={copiedId}
                isAdmin={isAdmin}
                onCopy={() => handleCopy(link.token, link.id)}
                onDeactivate={() => deactivate.mutate({ id: link.id })}
                onDelete={() => deleteMutation.mutate({ id: link.id })}
                isDeactivating={deactivate.isPending}
                isDeleting={deleteMutation.isPending}
              />
            ))}

            {/* Inactive links (collapsed) */}
            {inactiveLinks.length > 0 && (
              <InactiveLinksAccordion
                links={inactiveLinks}
                isAdmin={isAdmin}
                onDelete={(id) => deleteMutation.mutate({ id })}
                isDeleting={deleteMutation.isPending}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ─── Link row ─────────────────────────────────────────────────────────────────

type LinkData = {
  id: string;
  token: string;
  label: string | null;
  maxUses: number | null;
  useCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  createdBy: { name: string; avatar: string | null };
};

function LinkRow({
  link, copiedId, isAdmin, onCopy, onDeactivate, onDelete, isDeactivating, isDeleting,
}: {
  link: LinkData;
  copiedId: string | null;
  isAdmin: boolean;
  onCopy: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  isDeactivating: boolean;
  isDeleting: boolean;
}) {
  const url = `${APP_URL}/invite/${link.token}`;
  const isCopied = copiedId === link.id;
  const isExpired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false;
  const isMaxed = link.maxUses !== null && link.useCount >= link.maxUses;

  return (
    <div className={`border rounded-xl p-4 transition-colors ${link.isActive && !isExpired && !isMaxed ? 'border-[#1E3A5F] bg-[#112540]' : 'border-[#1E3A5F]/50 bg-[#112540]/50 opacity-60'}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Label + status */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-medium text-[#E8F0F8] truncate">
              {link.label ?? 'Invite link'}
            </span>
            {isExpired && <Badge color="red">Expired</Badge>}
            {isMaxed && <Badge color="amber">Max uses reached</Badge>}
            {!link.isActive && !isExpired && !isMaxed && <Badge color="gray">Deactivated</Badge>}
          </div>

          {/* URL preview */}
          <p className="text-xs text-[#7A9BBF] font-mono truncate mb-2">{url}</p>

          {/* Meta */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-[#7A9BBF]">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {link.maxUses ? `${link.useCount} / ${link.maxUses} uses` : `${link.useCount} uses`}
            </span>
            {link.expiresAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {isExpired
                  ? `Expired ${formatDistanceToNow(new Date(link.expiresAt), { addSuffix: true })}`
                  : `Expires ${formatDistanceToNow(new Date(link.expiresAt), { addSuffix: true })}`}
              </span>
            )}
            <span>by {link.createdBy.name}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Copy */}
          <button
            onClick={onCopy}
            disabled={!link.isActive || isExpired || isMaxed}
            className="p-2 rounded-lg hover:bg-[#1E3A5F] text-[#7A9BBF] hover:text-[#E8F0F8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Copy link"
          >
            {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Open in new tab */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-[#1E3A5F] text-[#7A9BBF] hover:text-[#E8F0F8] transition-colors"
            title="Open link"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Deactivate (manager+) */}
          {link.isActive && !isExpired && !isMaxed && (
            <button
              onClick={onDeactivate}
              disabled={isDeactivating}
              className="p-2 rounded-lg hover:bg-[#1E3A5F] text-[#7A9BBF] hover:text-amber-400 transition-colors"
              title="Deactivate link"
            >
              {isDeactivating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ToggleRight className="w-4 h-4" />}
            </button>
          )}

          {/* Delete (admin+) */}
          {isAdmin && (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="p-2 rounded-lg hover:bg-[#1E3A5F] text-[#7A9BBF] hover:text-red-400 transition-colors"
              title="Delete link"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: 'red' | 'amber' | 'gray' }) {
  const colors = {
    red:   'bg-red-500/10 text-red-400 border-red-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    gray:  'bg-[#1E3A5F] text-[#7A9BBF] border-[#1E3A5F]',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[color]}`}>{children}</span>
  );
}

function InactiveLinksAccordion({
  links, isAdmin, onDelete, isDeleting,
}: {
  links: LinkData[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-xs text-[#7A9BBF] hover:text-[#E8F0F8] transition-colors py-1"
      >
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {links.length} inactive link{links.length !== 1 ? 's' : ''}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {links.map((link) => (
            <LinkRow
              key={link.id}
              link={link}
              copiedId={null}
              isAdmin={isAdmin}
              onCopy={() => {}}
              onDeactivate={() => {}}
              onDelete={() => onDelete(link.id)}
              isDeactivating={false}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Leave Workspace section ──────────────────────────────────────────────────

function LeaveWorkspaceSection({
  workspaceName,
  onLeft,
}: {
  workspaceName: string;
  onLeft: () => void;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const leaveMutation = trpc.workspaces.members.leave.useMutation({
    onSuccess: () => {
      toast.success(`You have left "${workspaceName}"`);
      onLeft();
      router.push('/workspaces');
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <section className="bg-[#0D1F35] border border-red-500/20 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-red-500/10">
        <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
          <LogOut className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[#E8F0F8]">Leave Workspace</p>
          <p className="text-xs text-[#7A9BBF]">
            Remove yourself from <span className="text-[#E8F0F8]">{workspaceName}</span>
          </p>
        </div>
      </div>

      <div className="px-6 py-5">
        {!confirming ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#7A9BBF] max-w-sm">
              You will lose access to all channels, tasks, and documents in this workspace.
              You can rejoin later with an invite link or join code.
            </p>
            <button
              onClick={() => setConfirming(true)}
              className="ml-4 shrink-0 flex items-center gap-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Leave workspace
            </button>
          </div>
        ) : (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#E8F0F8] text-sm">
                  Are you sure you want to leave <span className="text-red-400">{workspaceName}</span>?
                </p>
                <p className="text-xs text-[#7A9BBF] mt-1">
                  This action will immediately remove your access. You cannot undo this yourself.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                {leaveMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Leaving…</>
                  : <><LogOut className="w-4 h-4" /> Yes, leave workspace</>}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={leaveMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm text-[#7A9BBF] hover:text-[#E8F0F8] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
