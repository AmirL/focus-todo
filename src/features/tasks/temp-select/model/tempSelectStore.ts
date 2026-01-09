import { create } from 'zustand';

interface TempSelectState {
  // Array to maintain selection order (last item = last selected)
  selectedTaskIds: string[];

  // Actions
  toggleSelection: (taskId: string) => void;
  clearSelections: () => void;
  isSelected: (taskId: string) => boolean;
  getLastSelected: () => string | undefined;
}

export const useTempSelectStore = create<TempSelectState>((set, get) => ({
  selectedTaskIds: [],

  toggleSelection: (taskId: string) => {
    const { selectedTaskIds } = get();
    const index = selectedTaskIds.indexOf(taskId);

    if (index > -1) {
      // Already selected - remove it
      set({
        selectedTaskIds: selectedTaskIds.filter((id) => id !== taskId),
      });
    } else {
      // Not selected - add it to the end
      set({
        selectedTaskIds: [...selectedTaskIds, taskId],
      });
    }
  },

  clearSelections: () => set({ selectedTaskIds: [] }),

  isSelected: (taskId: string) => {
    const { selectedTaskIds } = get();
    return selectedTaskIds.includes(taskId);
  },

  getLastSelected: () => {
    const { selectedTaskIds } = get();
    return selectedTaskIds[selectedTaskIds.length - 1];
  },
}));
