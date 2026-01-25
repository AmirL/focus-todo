'use client';
import { TaskModel } from '@/entities/task/model/task';
import { useTempSelectStore } from '@/entities/task/model/tempSelectStore';
import { TaskWithActions } from './TaskWithActions';

interface LastSelectedTaskHeaderProps {
  tasks: TaskModel[];
}

export function LastSelectedTaskHeader({ tasks }: LastSelectedTaskHeaderProps) {
  const { getLastSelected } = useTempSelectStore();
  const lastSelectedId = getLastSelected();

  const lastSelectedTask = tasks.find((t) => t.id === lastSelectedId);

  if (!lastSelectedTask) return null;

  return (
    <div className="fixed top-0 left-0 right-0 md:left-48 z-50 bg-white/95 backdrop-blur-sm border-b-2 border-blue-400 shadow-md">
      <div className="px-4 py-2 text-sm text-muted-foreground">
        Last Selected for Comparison:
      </div>
      <TaskWithActions task={lastSelectedTask} />
    </div>
  );
}
