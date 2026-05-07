'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { fadeUp, staggerContainer, modalVariants, backdropVariants } from '@/lib/animations';
import { getLeaveStatusColor, formatDate } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const leaveSchema = z.object({
  type: z.enum(['SICK', 'CASUAL', 'EARNED', 'MATERNITY', 'PATERNITY', 'UNPAID']),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().min(1, 'End date required'),
  reason: z.string().min(10, 'Please provide a detailed reason (min 10 chars)').max(500),
});

type LeaveFormData = z.infer<typeof leaveSchema>;

const LEAVE_COLORS: Record<string, string> = {
  SICK: '#EF4444',
  CASUAL: '#178582',
  EARNED: '#BFA181',
  MATERNITY: '#EC4899',
  PATERNITY: '#3B82F6',
  UNPAID: '#D4B896',
};

export default function LeavesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  const utils = trpc.useUtils();
  const { data: meData } = trpc.users.me.useQuery();
  const isManager = meData?.role === 'MANAGER' || meData?.role === 'ADMIN';

  const { data: myLeaves } = trpc.leaves.list.useQuery({ all: false });
  const { data: allLeaves } = trpc.leaves.list.useQuery({ all: true }, { enabled: isManager });
  const { data: leavesByType } = trpc.analytics.leavesByType.useQuery();

  const requestLeave = trpc.leaves.request.useMutation({
    onSuccess: () => {
      toast.success('Leave request submitted!');
      utils.leaves.list.invalidate();
      setModalOpen(false);
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  const approveLeave = trpc.leaves.approve.useMutation({
    onSuccess: () => {
      toast.success('Leave approved');
      utils.leaves.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectLeave = trpc.leaves.reject.useMutation({
    onSuccess: () => {
      toast.success('Leave rejected');
      utils.leaves.list.invalidate();
      setRejectId(null);
      setRejectComment('');
    },
    onError: (err) => toast.error(err.message),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
  });

  const onSubmit = (data: LeaveFormData) => {
    requestLeave.mutate({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
  };

  const pieData = leavesByType?.map((item) => ({
    name: item.type,
    value: item.count,
  })) ?? [];

  const pendingLeaves = allLeaves?.filter((l) => l.status === 'PENDING') ?? [];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Leave Management</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your time off requests</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 shimmer-btn text-white font-semibold px-4 py-2 rounded-lg text-sm hover:shadow-glow-primary transition-all"
        >
          <Plus size={16} />
          Request Leave
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leave balance chart */}
        <motion.div variants={fadeUp} className="glass-card rounded-xl p-5">
          <h2 className="font-display font-semibold text-white mb-4">Leave Distribution</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={LEAVE_COLORS[entry.name] ?? '#178582'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0D1F35',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: '#FAFAFA',
                  }}
                />
                <Legend formatter={(value) => <span className="text-zinc-400 text-xs">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">
              No approved leaves yet
            </div>
          )}
        </motion.div>

        {/* My leave history */}
        <motion.div variants={fadeUp} className="glass-card rounded-xl p-5 lg:col-span-2">
          <h2 className="font-display font-semibold text-white mb-4">My Leave History</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {myLeaves?.map((leave) => (
              <div key={leave.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#112540]">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: LEAVE_COLORS[leave.type] ?? '#178582' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{leave.type}</p>
                  <p className="text-xs text-zinc-500">
                    {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getLeaveStatusColor(leave.status)}`}>
                  {leave.status}
                </span>
              </div>
            ))}
            {(!myLeaves || myLeaves.length === 0) && (
              <p className="text-zinc-600 text-sm text-center py-4">No leave requests yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Manager view: pending approvals */}
      {isManager && pendingLeaves.length > 0 && (
        <motion.div variants={fadeUp} className="glass-card rounded-xl p-5">
          <h2 className="font-display font-semibold text-white mb-4">
            Pending Approvals
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {pendingLeaves.length}
            </span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-2 text-xs font-medium text-zinc-400 uppercase">Employee</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-zinc-400 uppercase">Type</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-zinc-400 uppercase hidden sm:table-cell">Dates</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-zinc-400 uppercase hidden md:table-cell">Reason</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-zinc-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-[#112540] transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={leave.user?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.user?.name ?? 'U')}&background=178582&color=fff&size=28`}
                          alt={leave.user?.name}
                          className="w-7 h-7 rounded-full"
                        />
                        <span className="text-sm text-white">{leave.user?.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                        style={{ background: LEAVE_COLORS[leave.type] ?? '#178582' }}
                      >
                        {leave.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="text-sm text-zinc-400">
                        {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="text-sm text-zinc-400 line-clamp-1 max-w-[200px]">{leave.reason}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveLeave.mutate({ id: leave.id })}
                          disabled={approveLeave.isPending}
                          className="p-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                          title="Approve"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setRejectId(leave.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Reject"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Request Leave Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md glass-card rounded-2xl p-6 z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">Request Leave</h2>
                <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Leave Type</label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white focus:outline-none focus:border-primary text-sm appearance-none"
                  >
                    <option value="SICK">Sick Leave</option>
                    <option value="CASUAL">Casual Leave</option>
                    <option value="EARNED">Earned Leave</option>
                    <option value="MATERNITY">Maternity Leave</option>
                    <option value="PATERNITY">Paternity Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      {...register('startDate')}
                      className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white focus:outline-none focus:border-primary text-sm"
                    />
                    {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">End Date</label>
                    <input
                      type="date"
                      {...register('endDate')}
                      className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white focus:outline-none focus:border-primary text-sm"
                    />
                    {errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.endDate.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Reason</label>
                  <textarea
                    {...register('reason')}
                    rows={3}
                    placeholder="Please provide a reason for your leave request..."
                    className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary text-sm resize-none"
                  />
                  {errors.reason && <p className="text-red-400 text-xs mt-1">{errors.reason.message}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestLeave.isPending}
                    className="flex-1 shimmer-btn text-white font-semibold py-2.5 rounded-lg transition-all hover:shadow-glow-primary disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {requestLeave.isPending ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : null}
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject modal */}
      <AnimatePresence>
        {rejectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setRejectId(null)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-sm glass-card rounded-2xl p-6 z-10"
            >
              <h2 className="font-display text-lg font-bold text-white mb-4">Reject Leave</h2>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Reason for rejection..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary text-sm resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectId(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!rejectComment.trim()) {
                      toast.error('Please provide a reason');
                      return;
                    }
                    rejectLeave.mutate({ id: rejectId, comments: rejectComment });
                  }}
                  disabled={rejectLeave.isPending}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
