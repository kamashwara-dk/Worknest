'use client';

import { motion } from 'framer-motion';
import { CheckSquare, Calendar, Users, Plus, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { fadeUp, staggerContainer } from '@/lib/animations';
import { formatDate, getPriorityColor, getLeaveStatusColor } from '@/lib/utils';
import { format } from 'date-fns';
import CountUp from 'react-countup';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import Link from 'next/link';

const COLORS = ['#178582', '#3B82F6', '#D4B896', '#BFA181'];

function KPICard({
  title,
  value,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  href: string;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Link href={href}>
        <div className="glass-card rounded-xl p-5 hover:shadow-card-hover transition-all duration-300 group cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
              <Icon size={18} className="text-white" />
            </div>
            <TrendingUp size={14} className="text-zinc-600 group-hover:text-secondary transition-colors" />
          </div>
          <div className="font-display text-3xl font-bold text-white mb-1">
            <CountUp end={value} duration={1.5} />
          </div>
          <p className="text-zinc-400 text-sm">{title}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: meData } = trpc.users.me.useQuery();
  const { data: tasksData } = trpc.tasks.list.useQuery({ limit: 5 });
  const { data: leavesData } = trpc.leaves.list.useQuery({ status: 'PENDING' });
  const { data: announcementsData } = trpc.announcements.list.useQuery({ pinned: true, limit: 2 });
  const { data: analyticsData } = trpc.analytics.overview.useQuery();
  trpc.users.list.useQuery(); // prefetch team data
  const { data: tasksByPriority } = trpc.analytics.tasksByPriority.useQuery();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const pieData = tasksByPriority?.map((item) => ({
    name: item.priority,
    value: item.count,
  })) ?? [];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Welcome banner */}
      <motion.div
        variants={fadeUp}
        className="glass-card rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">
            {greeting}, {meData?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-zinc-400">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · Here&apos;s what&apos;s happening today
          </p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <KPICard
          title="Open Tasks"
          value={analyticsData?.totalTasks ?? 0}
          icon={CheckSquare}
          color="bg-primary"
          href="/tasks"
        />
        <KPICard
          title="Pending Leaves"
          value={analyticsData?.pendingLeaves ?? 0}
          icon={Calendar}
          color="bg-amber-500"
          href="/leaves"
        />
        <KPICard
          title="Team Members"
          value={analyticsData?.activeMembersCount ?? 0}
          icon={Users}
          color="bg-secondary"
          href="/team"
        />
        <KPICard
          title="Completion Rate"
          value={analyticsData?.completionRate ?? 0}
          icon={TrendingUp}
          color="bg-violet-500"
          href="/analytics"
        />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Task completion chart */}
        <motion.div variants={fadeUp} className="glass-card rounded-xl p-5">
          <h2 className="font-display font-semibold text-white mb-4">Tasks by Priority</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <Legend
                  formatter={(value) => <span className="text-zinc-400 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">
              No task data yet
            </div>
          )}
        </motion.div>

        {/* Recent tasks */}
        <motion.div variants={fadeUp} className="glass-card rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">Recent Tasks</h2>
            <Link href="/tasks" className="text-xs text-primary hover:text-primary/80 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {tasksData?.tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#112540] hover:bg-[#152B4A] transition-colors"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.status === 'DONE' ? 'bg-secondary' :
                  task.status === 'IN_PROGRESS' ? 'bg-primary' :
                  task.status === 'IN_REVIEW' ? 'bg-amber-500' : 'bg-zinc-500'
                }`} />
                <span className="text-sm text-zinc-300 flex-1 truncate">{task.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-zinc-500 hidden sm:block">
                    {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            ))}
            {(!tasksData?.tasks || tasksData.tasks.length === 0) && (
              <p className="text-zinc-600 text-sm text-center py-4">No tasks yet</p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pinned announcements */}
        <motion.div variants={fadeUp} className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">Pinned Announcements</h2>
            <Link href="/announcements" className="text-xs text-primary hover:text-primary/80 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {announcementsData?.map((ann) => (
              <div key={ann.id} className="p-3 rounded-lg bg-[#112540] border-l-2 border-primary">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{ann.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${getPriorityColor(ann.priority)}`}>
                    {ann.priority}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2">{ann.body}</p>
              </div>
            ))}
            {(!announcementsData || announcementsData.length === 0) && (
              <p className="text-zinc-600 text-sm text-center py-4">No pinned announcements</p>
            )}
          </div>
        </motion.div>

        {/* Pending leaves */}
        <motion.div variants={fadeUp} className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">Pending Leaves</h2>
            <Link href="/leaves" className="text-xs text-primary hover:text-primary/80 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {leavesData?.slice(0, 4).map((leave) => (
              <div key={leave.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#112540]">
                <img
                  src={leave.user?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.user?.name ?? 'U')}&background=178582&color=fff&size=32`}
                  alt={leave.user?.name}
                  className="w-7 h-7 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{leave.user?.name}</p>
                  <p className="text-xs text-zinc-500">{leave.type} · {formatDate(leave.startDate)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getLeaveStatusColor(leave.status)}`}>
                  {leave.status}
                </span>
              </div>
            ))}
            {(!leavesData || leavesData.length === 0) && (
              <p className="text-zinc-600 text-sm text-center py-4">No pending leaves</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick add task FAB */}
      <Link
        href="/tasks"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full shimmer-btn flex items-center justify-center shadow-glow-primary hover:scale-110 transition-transform z-20"
        aria-label="Add task"
      >
        <Plus size={20} className="text-white" />
      </Link>
    </motion.div>
  );
}
