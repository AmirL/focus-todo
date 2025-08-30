'use client';

import { create } from 'zustand';
import { TaskModel } from '@/entities/task/model/task';

type EditTaskModalState = {
  open: boolean;
  task: TaskModel | null;
  openWithTask: (task: TaskModel) => void;
  close: () => void;
};

export const useEditTaskModalStore = create<EditTaskModalState>((set) => ({
  open: false,
  task: null,
  openWithTask: (task) => set({ open: true, task }),
  close: () => set({ open: false, task: null }),
}));

