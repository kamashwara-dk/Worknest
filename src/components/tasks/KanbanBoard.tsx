'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import type { Task, TaskStatus } from '@/types';

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'TODO', title: 'To Do', color: 'bg-zinc-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-primary' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'bg-amber-500' },
  { id: 'DONE', title: 'Done', color: 'bg-secondary' },
];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const utils = trpc.useUtils();

  const updateStatus = trpc.tasks.updateStatus.useMutation({
    onError: () => {
      toast.error('Failed to update task');
      setLocalTasks(tasks);
    },
    onSuccess: () => {
      utils.tasks.list.invalidate();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => localTasks.filter((t) => t.status === status),
    [localTasks]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = localTasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = localTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropping over a column
    const overColumn = COLUMNS.find((c) => c.id === overId);
    if (overColumn && activeTask.status !== overColumn.id) {
      setLocalTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: overColumn.id } : t
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = localTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Determine target status
    const overColumn = COLUMNS.find((c) => c.id === overId);
    const overTask = localTasks.find((t) => t.id === overId);
    const targetStatus = overColumn?.id ?? overTask?.status ?? activeTask.status;

    if (targetStatus !== activeTask.status) {
      updateStatus.mutate({
        id: activeId,
        status: targetStatus,
      });
    }
  };

  // Sync local tasks when prop changes
  if (JSON.stringify(tasks.map((t) => t.id + t.status)) !== JSON.stringify(localTasks.map((t) => t.id + t.status))) {
    setLocalTasks(tasks);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:snap-none">
        {COLUMNS.map((col) => (
          <div key={col.id} className="snap-start flex-shrink-0 w-[85vw] sm:w-auto sm:flex-1 min-w-[260px]">
            <KanbanColumn
              id={col.id}
              title={col.title}
              color={col.color}
              tasks={getTasksByStatus(col.id)}
              onTaskClick={onTaskClick}
            />
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 opacity-90">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
