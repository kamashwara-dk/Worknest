'use client';

import { motion } from 'framer-motion';
import { Calendar, Tag, MoreHorizontal } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getPriorityColor, formatDate } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layoutId={task.id}
      whileHover={{ y: -2 }}
      className="glass-card rounded-xl p-4 cursor-grab active:cursor-grabbing hover:shadow-card-hover transition-shadow duration-200 group"
      onClick={(e) => {
        e.stopPropagation();
        onClick(task);
      }}
    >
      {/* Priority + menu */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-white p-0.5 rounded"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-white mb-2 line-clamp-2 leading-snug">
        {task.title}
      </h3>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary/80"
            >
              <Tag size={9} />
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-zinc-500">+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {task.dueDate ? (
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Calendar size={11} />
            {formatDate(task.dueDate)}
          </div>
        ) : (
          <div />
        )}

        {task.assignee && (
          <img
            src={task.assignee.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignee.name)}&background=178582&color=fff&size=24`}
            alt={task.assignee.name}
            className="w-6 h-6 rounded-full border border-border"
            title={task.assignee.name}
          />
        )}
      </div>
    </motion.div>
  );
}
