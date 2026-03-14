'use client';

import * as React from 'react';
import { TaskModel } from '@/entities/task/model/task';
import { useEditTaskModalStore } from '@/features/tasks/edit';

export function useSpotlightSelectTask(setOpen: (o: boolean) => void) {
  const openEdit = useEditTaskModalStore((s) => s.openWithTask);
  const selectTask = React.useCallback(
    (task: TaskModel) => {
      setOpen(false);
      // Delay to avoid overlapping dialog animations
      setTimeout(() => openEdit(task), 120);
    },
    [setOpen, openEdit]
  );

  return { selectTask } as const;
}

