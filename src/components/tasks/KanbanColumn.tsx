'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
  onTaskClick: (task: Task) => void;
}

export function KanbanColumn({ id, title, tasks, color, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col min-w-[280px] sm:min-w-0 w-full">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <h3 className="font-display font-semibold text-white text-sm">{title}</h3>
        <span className="ml-auto text-xs text-zinc-500 bg-[#112540] px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'kanban-column flex-1 border border-dashed border-transparent rounded-xl transition-all duration-200',
          isOver && 'border-primary/40 bg-primary/5'
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-zinc-600 text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
