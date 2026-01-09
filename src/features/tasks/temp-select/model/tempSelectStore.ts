'use client';

import { create } from 'zustand';

interface TempSelectState {
  // Set of task IDs that are temporarily selected
  selectedTaskIds: Set<string>;

  // Actions
  toggleSelection: (taskId: string) => void;
  clearSelections: () => void;
  isSelected: (taskId: string) => boolean;
}

export const useTempSelectStore = create<TempSelectState>((set, get) => ({
  selectedTaskIds: new Set<string>(),

  toggleSelection: (taskId: string) =>
    set((state) => {
      const newSet = new Set(state.selectedTaskIds);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return { selectedTaskIds: newSet };
    }),

  clearSelections: () => set({ selectedTaskIds: new Set<string>() }),

  isSelected: (taskId: string) => get().selectedTaskIds.has(taskId),
}));
