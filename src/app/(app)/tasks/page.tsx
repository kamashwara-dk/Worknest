'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, LayoutGrid, List, Search } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { fadeUp, staggerContainer } from '@/lib/animations';
import { getPriorityColor, getStatusColor, formatDate } from '@/lib/utils';
import type { Task } from '@/types';

type ViewMode = 'kanban' | 'list';

export default function TasksPage() {
  const [view, setView] = useState<ViewMode>('kanban');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data, isLoading } = trpc.tasks.list.useQuery({
    search: search || undefined,
    priority: (filterPriority as Task['priority']) || undefined,
    status: (filterStatus as Task['status']) || undefined,
    limit: 100,
  });

  const tasks = data?.tasks ?? [];

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-full space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Tasks</h1>
          <p className="text-zinc-400 text-sm mt-1">{data?.total ?? 0} total tasks</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-surface rounded-lg border border-border p-1">
            <button
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-md transition-colors ${view === 'kanban' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white'}`}
              aria-label="Kanban view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white'}`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={handleCreateTask}
            className="flex items-center gap-2 shimmer-btn text-white font-semibold px-4 py-2 rounded-lg text-sm hover:shadow-glow-primary transition-all"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary text-sm transition-colors"
          />
        </div>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface border border-border text-zinc-300 focus:outline-none focus:border-primary text-sm appearance-none"
        >
          <option value="">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface border border-border text-zinc-300 focus:outline-none focus:border-primary text-sm appearance-none"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : view === 'kanban' ? (
        <motion.div variants={fadeUp}>
          <KanbanBoard tasks={tasks} onTaskClick={handleTaskClick} />
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden sm:table-cell">Assignee</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden md:table-cell">Due Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-[#112540] transition-colors cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-white font-medium">{task.title}</p>
                        {task.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {task.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary/80">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={task.assignee.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignee.name)}&background=178582&color=fff&size=24`}
                            alt={task.assignee.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-zinc-300">{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-zinc-400">
                        {task.dueDate ? formatDate(task.dueDate) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tasks.length === 0 && (
              <div className="text-center py-12 text-zinc-600">
                No tasks found. Create your first task!
              </div>
            )}
          </div>
        </motion.div>
      )}

      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedTask(null); }}
        task={selectedTask}
      />
    </motion.div>
  );
}
