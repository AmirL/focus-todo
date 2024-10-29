import { Task } from '@/classes/task';
import { apiRequest } from '@/components/api';
import { plainToInstance } from 'class-transformer';
import { create } from 'zustand';

type TasksState = {
  tasks: Task[];
  error: string | null;
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  error: null,
  isLoading: true,
  fetchTasks: async () => {
    set({ isLoading: true });
    const data = await apiRequest('');
    set({ tasks: plainToInstance(Task, data.results as unknown[]), error: null, isLoading: false });
  },
  createTask: async (task: Task) => {
    const createdTask = plainToInstance(Task, await apiRequest('', 'POST', task));
    set((state) => ({ tasks: [...state.tasks, createdTask] }));
  },
  updateTask: async (id: string, updates: Partial<Task>) => {
    const task = Object.assign(new Task(), { ...updates });
    const updatedTask = plainToInstance(Task, await apiRequest(`${id}/`, 'PATCH', task));
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
    }));
  },

  deleteTask: async (id: string) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
    await apiRequest(`${id}/`, 'DELETE');
  },
}));
