import { Task } from '@/data-classes/task';
import { API } from '@/lib/api';
import { create } from 'zustand';

type TasksState = {
  tasks: Task[];
  error: string | null;
  isLoading: boolean;
  createTaskInput: string;
  setCreateTaskInput: (input: string) => void;
  fetchTasks: () => Promise<void>;
  createTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
};

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  error: null,
  isLoading: true,
  createTaskInput: '',
  setCreateTaskInput: (input: string) => {
    set({ createTaskInput: input });
  },
  fetchTasks: async () => {
    set({ isLoading: true });
    const data = await API.getTasks();
    set({ tasks: Task.toInstanceArray(data.results), error: null, isLoading: false });
  },
  createTask: async (task: Task) => {
    try {
      const response = await API.createTask(task);
      const createdTask = Task.toInstance(response);
      set((state) => ({ tasks: [...state.tasks, createdTask] }));
      set({ createTaskInput: '' });
    } catch (error) {}
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
}));
