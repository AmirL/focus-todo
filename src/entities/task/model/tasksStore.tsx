import { create } from 'zustand';

type TasksState = {
  showTaskList: boolean;
  setShowTaskList: (show: boolean) => void;
};

export const useTasksStore = create<TasksState>((set) => ({
  showTaskList: true, // Show the list the task belongs to near the task name
  setShowTaskList: (show: boolean) => set({ showTaskList: show }),
}));
