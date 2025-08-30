'use client';

import { create } from 'zustand';
import { TaskModel } from '@/entities/task/model/task';

type ReAddModalState = {
  open: boolean;
  task: TaskModel | null;
  initialDate: Date | null;
  openWithTask: (task: TaskModel, initialDate: Date | null) => void;
  close: () => void;
};

export const useReAddModalStore = create<ReAddModalState>((set) => ({
  open: false,
  task: null,
  initialDate: null,
  openWithTask: (task, initialDate) => set({ open: true, task, initialDate }),
  close: () => set({ open: false, task: null, initialDate: null }),
}));

