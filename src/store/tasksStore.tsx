import { Task } from '@/data-classes/task';
import { API } from '@/lib/api';
import { create } from 'zustand';

type TasksState = {
  tasks: Task[];
  isLoading: boolean;
  createTaskInput: string;
  setCreateTaskInput: (input: string) => void;
  fetchTasks: () => Promise<void>;
  createTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  clearSelectedTasks: () => void;
  clearCompletedTasks: () => void;
};

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: true,
  createTaskInput: '',
  setCreateTaskInput: (input: string) => {
    set({ createTaskInput: input });
  },
  fetchTasks: async () => {
    set({ isLoading: true });
    const data = await API.getTasks();
    set({ tasks: Task.fromPlainArray(data.tasks), isLoading: false });
  },
  createTask: async (task: Task) => {
    const inputValue = get().createTaskInput;
    try {
      set({ createTaskInput: '' });
      const response = await API.createTask(task);
      const createdTask = Task.toInstance(response);
      set((state) => ({ tasks: [...state.tasks, createdTask] }));
    } catch (error) {
      // error message was shown in the toast
      set({ createTaskInput: inputValue });
    }
  },
  updateTask: async (id: string, updates: Partial<Task>) => {
    const task = get().tasks.find((task) => task.id == id);
    if (!task) return;

    const updatedTask = Object.assign(new Task(), { ...task, ...updates });
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
    }));

    const response = await API.updateTask(id, updatedTask);
    const fetchedTask = Task.toInstance(response);
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? fetchedTask : task)),
    }));
  },
  clearSelectedTasks: () => {
    // set({ tasks: get().tasks.filter((task) => !task.isSelected) });
  },
  clearCompletedTasks: () => {
    // set({ tasks: get().tasks.filter((task) => !task.isCompleted) });
  },
}));
