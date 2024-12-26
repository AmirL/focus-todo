import { Task } from '@/data-classes/task';
import { API, apiRequest } from '@/components/api';
import { plainToInstance } from 'class-transformer';
import { create } from 'zustand';

type TasksState = {
  tasks: Task[];
  error: string | null;
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
};

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  error: null,
  isLoading: true,
  fetchTasks: async () => {
    set({ isLoading: true });
    const data = await API.getTasks();
    set({ tasks: plainToInstance(Task, data.results as unknown[]), error: null, isLoading: false });
  },
  createTask: async (task: Task) => {
    const response = await API.createTask(task);
    const createdTask = plainToInstance(Task, response);
    set((state) => ({ tasks: [...state.tasks, createdTask] }));
  },
  updateTask: async (id: string, updates: Partial<Task>) => {
    const task = get().tasks.find((task) => task.id == id);
    if (!task) return;

    const updatedTask = Object.assign(new Task(), { ...task, ...updates });
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
    }));

    const response = await API.updateTask(id, updatedTask);
    const fetchedTask = plainToInstance(Task, response);
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? fetchedTask : task)),
    }));
  },
}));
