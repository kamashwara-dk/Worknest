'use client';

import { use } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { setWorkspace } = useWorkspaceStore();

  // Try open invite link first, fall back to email invitation
  const linkPreview = trpc.workspaces.inviteLinks.preview.useQuery(
    { token },
    { retry: false }
  );
  const emailInvite = trpc.invitations.byToken.useQuery(
    { token },
    { enabled: linkPreview.isError, retry: false }
  );

  const acceptLink = trpc.workspaces.inviteLinks.accept.useMutation({
    onSuccess: ({ membership, workspace }) => {
      setWorkspace({ id: workspace.id, slug: workspace.slug, name: workspace.name, role: membership.role });
      toast.success(`Joined ${workspace.name}`);
      router.push(`/w/${workspace.slug}/dashboard`);
    },
    onError: (err) => toast.error(err.message),
  });

  const acceptEmail = trpc.invitations.accept.useMutation({
    onSuccess: ({ membership, workspace }) => {
      setWorkspace({ id: workspace.id, slug: workspace.slug, name: workspace.name, role: membership.role });
      toast.success(`Joined ${workspace.name}`);
      router.push(`/w/${workspace.slug}/dashboard`);
    },
    onError: (err) => toast.error(err.message),
  });

  const isLoading = linkPreview.isLoading || (linkPreview.isError && emailInvite.isLoading);
  const isPending = acceptLink.isPending || acceptEmail.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1828] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#178582] animate-spin" />
      </div>
    );
  }

  // ── Open invite link ──────────────────────────────────────────────────────
  if (linkPreview.data) {
    const link = linkPreview.data;

    if (!link.isValid) {
      const messages: Record<string, string> = {
        deactivated: 'This invite link has been deactivated by the workspace admin.',
        expired: 'This invite link has expired.',
        max_uses_reached: 'This invite link has reached its maximum number of uses.',
      };
      return (
        <StatusScreen
          icon={<XCircle className="w-12 h-12 text-red-400" />}
          title="Link no longer valid"
          message={messages[link.reason ?? ''] ?? 'This invite link is no longer valid.'}
          action={{ label: 'Go to workspaces', href: '/workspaces' }}
        />
      );
    }

    return (
      <InviteCard
        workspaceName={link.workspace.name}
        workspaceLogo={link.workspace.logoUrl}
        inviterName={link.createdBy.name}
        inviterAvatar={link.createdBy.avatar}
        meta={[
          link.maxUses ? `${link.useCount} / ${link.maxUses} uses` : 'Unlimited uses',
          link.expiresAt
            ? `Expires ${new Date(link.expiresAt).toLocaleDateString()}`
            : 'No expiry',
        ]}
        isPending={isPending}
        onAccept={() => acceptLink.mutate({ token })}
        onDecline={() => router.push('/workspaces')}
      />
    );
  }

  // ── Email invitation ──────────────────────────────────────────────────────
  if (emailInvite.data) {
    const inv = emailInvite.data;

    if (inv.status === 'ACCEPTED') {
      return (
        <StatusScreen
          icon={<CheckCircle className="w-12 h-12 text-green-400" />}
          title="Already accepted"
          message="You've already joined this workspace."
          action={{ label: 'Go to workspaces', href: '/workspaces' }}
        />
      );
    }
    if (inv.status === 'EXPIRED' || inv.status === 'REVOKED') {
      return (
        <StatusScreen
          icon={<Clock className="w-12 h-12 text-amber-400" />}
          title={`Invitation ${inv.status.toLowerCase()}`}
          message="This invitation is no longer valid. Ask the workspace admin to send a new one."
        />
      );
    }

    return (
      <InviteCard
        workspaceName={inv.workspace.name}
        workspaceLogo={inv.workspace.logoUrl}
        inviterName={inv.invitedBy.name}
        inviterAvatar={inv.invitedBy.avatar}
        meta={[`Sent to ${inv.email}`, `Expires ${new Date(inv.expiresAt).toLocaleDateString()}`]}
        isPending={isPending}
        onAccept={() => acceptEmail.mutate({ token })}
        onDecline={() => router.push('/workspaces')}
      />
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  return (
    <StatusScreen
      icon={<XCircle className="w-12 h-12 text-red-400" />}
      title="Invalid invitation"
      message="This invitation link is invalid or no longer exists."
      action={{ label: 'Go to workspaces', href: '/workspaces' }}
    />
  );
}

// ── Shared UI components ──────────────────────────────────────────────────────

function InviteCard({
  workspaceName, workspaceLogo, inviterName, inviterAvatar,
  meta, isPending, onAccept, onDecline,
}: {
  workspaceName: string;
  workspaceLogo?: string | null;
  inviterName: string;
  inviterAvatar?: string | null;
  meta: string[];
  isPending: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0A1828] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0D1F35] border border-[#1E3A5F] rounded-2xl p-8 text-center"
      >
        {/* Workspace logo / icon */}
        <div className="flex justify-center mb-5">
          {workspaceLogo ? (
            <img src={workspaceLogo} alt={workspaceName} className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#178582]/20 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-[#178582]" />
            </div>
          )}
        </div>

        <p className="text-[#7A9BBF] text-sm mb-1">You've been invited to join</p>
        <h1 className="text-2xl font-bold text-[#BFA181] font-syne mb-1">{workspaceName}</h1>

        {/* Inviter */}
        <div className="flex items-center justify-center gap-2 mt-3 mb-5">
          {inviterAvatar ? (
            <img src={inviterAvatar} alt={inviterName} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#178582]/30 flex items-center justify-center text-xs text-[#178582] font-bold">
              {inviterName[0]}
            </div>
          )}
          <span className="text-sm text-[#7A9BBF]">Invited by <span className="text-[#E8F0F8]">{inviterName}</span></span>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-7">
          {meta.map((m) => (
            <span key={m} className="text-xs bg-[#112540] border border-[#1E3A5F] text-[#7A9BBF] px-3 py-1 rounded-full">
              {m}
            </span>
          ))}
        </div>

        <button
          onClick={onAccept}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-[#178582] hover:bg-[#178582]/90 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mb-3"
        >
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Joining…</> : 'Accept & Join Workspace'}
        </button>
        <button
          onClick={onDecline}
          className="w-full text-[#7A9BBF] hover:text-[#E8F0F8] transition-colors text-sm py-2"
        >
          Decline
        </button>
      </motion.div>
    </div>
  );
}

function StatusScreen({
  icon, title, message, action,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: { label: string; href: string };
}) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#0A1828] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-4">{icon}</div>
        <h1 className="text-xl font-bold text-[#E8F0F8] mb-2">{title}</h1>
        <p className="text-[#7A9BBF]">{message}</p>
        {action && (
          <button
            onClick={() => router.push(action.href)}
            className="mt-6 bg-[#178582] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#178582]/90 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
