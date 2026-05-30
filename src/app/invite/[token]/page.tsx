'use client';

import { use } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { setWorkspace } = useWorkspaceStore();

  const { data: invitation, isLoading, error } = trpc.invitations.byToken.useQuery({ token });

  const acceptMutation = trpc.invitations.accept.useMutation({
    onSuccess: ({ membership, workspace }) => {
      setWorkspace({
        id: workspace.id,
        slug: workspace.slug,
        name: workspace.name,
        role: membership.role,
      });
      toast.success(`Joined ${workspace.name}`);
      router.push(`/w/${workspace.slug}/dashboard`);
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1828] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#178582] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !invitation) {
    return <InviteStatus icon={<XCircle className="w-12 h-12 text-red-400" />} title="Invalid invitation" message="This invitation link is invalid or no longer exists." />;
  }

  if (invitation.status === 'ACCEPTED') {
    return <InviteStatus icon={<CheckCircle className="w-12 h-12 text-green-400" />} title="Already accepted" message="You've already joined this workspace." action={{ label: 'Go to workspaces', href: '/workspaces' }} />;
  }

  if (invitation.status === 'EXPIRED' || invitation.status === 'REVOKED') {
    return <InviteStatus icon={<Clock className="w-12 h-12 text-amber-400" />} title={`Invitation ${invitation.status.toLowerCase()}`} message="This invitation is no longer valid. Ask the workspace admin to send a new one." />;
  }

  return (
    <div className="min-h-screen bg-[#0A1828] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0D1F35] border border-[#1E3A5F] rounded-2xl p-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#178582]/20 flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8 text-[#178582]" />
        </div>

        <h1 className="text-2xl font-bold text-[#E8F0F8] font-syne mb-2">
          You're invited
        </h1>
        <p className="text-[#7A9BBF] mb-1">
          <span className="text-[#E8F0F8] font-medium">{invitation.invitedBy.name}</span> invited you to join
        </p>
        <p className="text-2xl font-bold text-[#BFA181] mb-8">{invitation.workspace.name}</p>

        <button
          onClick={() => acceptMutation.mutate({ token })}
          disabled={acceptMutation.isPending}
          className="w-full bg-[#178582] hover:bg-[#178582]/90 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {acceptMutation.isPending ? 'Joining…' : 'Accept & Join Workspace'}
        </button>

        <button
          onClick={() => router.push('/workspaces')}
          className="mt-3 w-full text-[#7A9BBF] hover:text-[#E8F0F8] transition-colors text-sm py-2"
        >
          Decline
        </button>
      </motion.div>
    </div>
  );
}

function InviteStatus({
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
