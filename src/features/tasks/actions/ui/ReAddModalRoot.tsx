'use client';

import { useReAddModalStore } from '../model/reAddModalStore';
import { ReAddDialog } from './ReAddDialog';

export function ReAddModalRoot() {
  const { open, task, initialDate, close } = useReAddModalStore();
  if (!task) return null;
  return <ReAddDialog open={open} onOpenChange={(o) => (o ? null : close())} task={task} initialDate={initialDate} />;
}

