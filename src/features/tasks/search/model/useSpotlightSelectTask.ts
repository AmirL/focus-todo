'use client';

import * as React from 'react';
import { TaskModel } from '@/entities/task/model/task';

export function useSpotlightSelectTask(setOpen: (o: boolean) => void) {
  const selectTask = React.useCallback((task: TaskModel) => {
    setOpen(false);
    setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>(`[data-testid="edit-task-${task.id}"]`);
      btn?.click();
    }, 120);
  }, [setOpen]);

  return { selectTask } as const;
}

