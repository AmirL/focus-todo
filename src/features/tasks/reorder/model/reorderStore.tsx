import { create } from 'zustand';
import { TaskModel } from '@/entities/task/model/task';

interface ReorderState {
  // Optimistic state for tasks being reordered
  optimisticTasks: TaskModel[] | null;
  isDragging: boolean;

  // Actions
  setOptimisticTasks: (tasks: TaskModel[]) => void;
  clearOptimisticTasks: () => void;
  setIsDragging: (isDragging: boolean) => void;
}

export const useReorderStore = create<ReorderState>((set) => ({
  optimisticTasks: null,
  isDragging: false,

  setOptimisticTasks: (tasks: TaskModel[]) => set({ optimisticTasks: tasks }),
  clearOptimisticTasks: () => set({ optimisticTasks: null }),
  setIsDragging: (isDragging: boolean) => set({ isDragging }),
}));