'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp, Users, CheckSquare, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { fadeUp, staggerContainer } from '@/lib/animations';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import CountUp from 'react-countup';

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#BFA181',
  MEDIUM: '#178582',
  HIGH: '#D4B896',
  URGENT: '#EF4444',
};

const LEAVE_COLORS: Record<string, string> = {
  SICK: '#EF4444',
  CASUAL: '#178582',
  EARNED: '#BFA181',
  MATERNITY: '#EC4899',
  PATERNITY: '#3B82F6',
  UNPAID: '#D4B896',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const tooltipStyle = {
  contentStyle: {
    background: '#0D1F35',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: '#FAFAFA',
    fontSize: '12px',
  },
};

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);

  const { data: overview } = trpc.analytics.overview.useQuery({ days });
  const { data: taskTrend } = trpc.analytics.taskTrend.useQuery({ days });
  const { data: tasksByPriority } = trpc.analytics.tasksByPriority.useQuery();
  const { data: leavesByType } = trpc.analytics.leavesByType.useQuery();
  const { data: teamActivity } = trpc.analytics.teamActivity.useQuery({ days });

  const handleExportCSV = () => {
    if (!taskTrend) return;
    const headers = ['Date', 'Created', 'Completed'];
    const rows = taskTrend.map((d) => [d.date, d.created, d.completed]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worknest-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const priorityData = tasksByPriority?.map((item) => ({
    name: item.priority,
    value: item.count,
  })) ?? [];

  const leaveData = leavesByType?.map((item) => ({
    name: item.type,
    value: item.count,
  })) ?? [];

  // Build heatmap data
  const maxActivity = teamActivity
    ? Math.max(...Object.values(teamActivity as Record<string, number>), 1)
    : 1;

  const getHeatmapColor = (value: number) => {
    if (!value) return 'rgba(23,133,130,0.05)';
    const intensity = value / maxActivity;
    return `rgba(23,133,130,${0.1 + intensity * 0.9})`;
  };

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
          <h1 className="font-display text-2xl font-bold text-white">Analytics</h1>
          <p className="text-zinc-400 text-sm mt-1">Team productivity insights</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range */}
          <div className="flex items-center bg-surface rounded-lg border border-border p-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  days === d ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </motion.div>

      {/* KPI row */}
      <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: overview?.totalTasks ?? 0, icon: CheckSquare, color: 'text-primary' },
          { label: 'Completion Rate', value: overview?.completionRate ?? 0, icon: TrendingUp, color: 'text-secondary', suffix: '%' },
          { label: 'Active Members', value: overview?.activeMembersCount ?? 0, icon: Users, color: 'text-accent' },
          { label: 'Pending Leaves', value: overview?.pendingLeaves ?? 0, icon: Clock, color: 'text-red-400' },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp} className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <kpi.icon size={18} className={kpi.color} />
              <span className="text-zinc-400 text-sm">{kpi.label}</span>
            </div>
            <div className={`font-display text-3xl font-bold ${kpi.color}`}>
              <CountUp end={kpi.value} duration={1.5} suffix={kpi.suffix} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Task trend chart */}
      <motion.div variants={fadeUp} className="glass-card rounded-xl p-5">
        <h2 className="font-display font-semibold text-white mb-4">Task Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={taskTrend ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Legend formatter={(v) => <span className="text-zinc-400 text-xs">{v}</span>} />
            <Line
              type="monotone"
              dataKey="created"
              stroke="#178582"
              strokeWidth={2}
              dot={false}
              name="Created"
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#BFA181"
              strokeWidth={2}
              dot={false}
              name="Completed"
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tasks by priority */}
        <motion.div variants={fadeUp} className="glass-card rounded-xl p-5">
          <h2 className="font-display font-semibold text-white mb-4">Tasks by Priority</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" name="Tasks" radius={[4, 4, 0, 0]} animationDuration={800}>
                {priorityData.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? '#178582'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Leave distribution */}
        <motion.div variants={fadeUp} className="glass-card rounded-xl p-5">
          <h2 className="font-display font-semibold text-white mb-4">Leave Distribution</h2>
          {leaveData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={leaveData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                >
                  {leaveData.map((entry) => (
                    <Cell key={entry.name} fill={LEAVE_COLORS[entry.name] ?? '#178582'} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend formatter={(v) => <span className="text-zinc-400 text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">
              No leave data yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Team activity heatmap */}
      <motion.div variants={fadeUp} className="glass-card rounded-xl p-5">
        <h2 className="font-display font-semibold text-white mb-4">Team Activity Heatmap</h2>
        <p className="text-zinc-500 text-xs mb-4">Task activity by day of week and hour</p>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex mb-1 ml-10">
              {HOURS.filter((h) => h % 3 === 0).map((h) => (
                <div key={h} className="flex-1 text-center text-xs text-zinc-600">
                  {h}:00
                </div>
              ))}
            </div>

            {/* Grid */}
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex items-center gap-1 mb-1">
                <span className="w-8 text-xs text-zinc-500 text-right flex-shrink-0">{day}</span>
                <div className="flex flex-1 gap-0.5">
                  {HOURS.map((hour) => {
                    const key = `${dayIndex}-${hour}`;
                    const value = (teamActivity as Record<string, number> | undefined)?.[key] ?? 0;
                    return (
                      <div
                        key={hour}
                        className="flex-1 h-5 rounded-sm transition-colors"
                        style={{ background: getHeatmapColor(value) }}
                        title={`${day} ${hour}:00 — ${value} activities`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center gap-2 mt-3 ml-10">
              <span className="text-xs text-zinc-600">Less</span>
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
                <div
                  key={intensity}
                  className="w-4 h-4 rounded-sm"
                  style={{ background: `rgba(23,133,130,${0.05 + intensity * 0.95})` }}
                />
              ))}
              <span className="text-xs text-zinc-600">More</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
