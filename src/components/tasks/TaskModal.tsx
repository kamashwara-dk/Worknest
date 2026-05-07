'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Tag, User } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { modalVariants, backdropVariants } from '@/lib/animations';
import type { Task } from '@/types';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  tags: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  onSuccess?: () => void;
}

export function TaskModal({ open, onClose, task, onSuccess }: TaskModalProps) {
  const utils = trpc.useUtils();
  const { data: usersData } = trpc.users.list.useQuery();

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success('Task created!');
      utils.tasks.list.invalidate();
      onSuccess?.();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success('Task updated!');
      utils.tasks.list.invalidate();
      onSuccess?.();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assigneeId: task.assigneeId ?? '',
        tags: task.tags.join(', '),
      });
    } else {
      reset({ title: '', description: '', status: 'TODO' as const, priority: 'MEDIUM' as const });
    }
  }, [task, reset]);

  const onSubmit = (data: TaskFormData) => {
    const payload = {
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      assigneeId: data.assigneeId || undefined,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };

    if (task) {
      updateTask.mutate({ id: task.id, ...payload });
    } else {
      createTask.mutate(payload);
    }
  };

  const isLoading = createTask.isPending || updateTask.isPending;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg glass-card rounded-2xl p-6 shadow-2xl z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-white">
                {task ? 'Edit Task' : 'Create Task'}
              </h2>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Title *</label>
                <input
                  {...register('title')}
                  placeholder="Task title..."
                  className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors text-sm"
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                <textarea
                  {...register('description')}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Status</label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white focus:outline-none focus:border-primary transition-colors text-sm appearance-none"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Priority</label>
                  <select
                    {...register('priority')}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white focus:outline-none focus:border-primary transition-colors text-sm appearance-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Due date */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    <Calendar size={12} className="inline mr-1" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    {...register('dueDate')}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    <User size={12} className="inline mr-1" />
                    Assignee
                  </label>
                  <select
                    {...register('assigneeId')}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white focus:outline-none focus:border-primary transition-colors text-sm appearance-none"
                  >
                    <option value="">Unassigned</option>
                    {usersData?.map((user) => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  <Tag size={12} className="inline mr-1" />
                  Tags (comma separated)
                </label>
                <input
                  {...register('tags')}
                  placeholder="design, frontend, urgent"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 shimmer-btn text-white font-semibold py-2.5 rounded-lg transition-all duration-200 hover:shadow-glow-primary disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : null}
                  {task ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
