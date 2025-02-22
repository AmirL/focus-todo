import { create } from 'zustand';

type AddTasksState = {
  createTaskInput: string;
  setCreateTaskInput: (input: string) => void;
};

export const useAddTasksStore = create<AddTasksState>((set, get) => ({
  createTaskInput: '',
  setCreateTaskInput: (input: string) => {
    set({ createTaskInput: input });
  },
}));
