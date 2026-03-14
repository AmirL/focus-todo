'use client';

import { useEditTaskModalStore } from '../model/editTaskModalStore';
import { EditTaskDialog } from './EditTaskDialog';

export function EditTaskModalRoot() {
  const { open, task, close } = useEditTaskModalStore();
  if (!task) return null;
  return <EditTaskDialog open={open} onOpenChange={(o) => (o ? null : close())} task={task} />;
}

