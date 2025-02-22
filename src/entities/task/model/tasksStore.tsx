import { TaskModel } from '@/entities/task/model/task';
import { create } from 'zustand';
import toast from 'react-hot-toast';
import { createTaskQuery } from '../api/createTaskQuery';
import { updateTaskQuery } from '../api/updateTaskQuery';
import { fetchAllTasks } from '../api/fetchAllTasks';

type TasksState = {
  tasks: TaskModel[];
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (task: TaskModel) => Promise<void>;
  updateTask: (id: string, updates: Partial<TaskModel>) => Promise<void>;
};

function syncTasks(existingTasks: TaskModel[], fetchedTasks: TaskModel[]): TaskModel[] {
  const mergedTasks = fetchedTasks.map((fetchedTask) => {
    const existingTask = existingTasks.find((task) => task.id === fetchedTask.id);
    if (existingTask) {
      return existingTask.updatedAt > fetchedTask.updatedAt ? existingTask : fetchedTask;
    }
    return fetchedTask;
  });

  // Add any tasks that are in existingTasks but not in fetchedTasks
  const newTasks = existingTasks.filter((task) => !fetchedTasks.some((fetchedTask) => fetchedTask.id === task.id));

  return [...mergedTasks, ...newTasks];
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: true,
  fetchTasks: async () => {
    console.log('fetching tasks');
    set({ isLoading: true });
    const fetchedTasks = await fetchAllTasks();

    set((state) => ({
      tasks: syncTasks(state.tasks, fetchedTasks),
      isLoading: false,
    }));
  },
  createTask: async (task: TaskModel) => {
    const createdTask = await createTaskQuery(task);
    set((state) => ({ tasks: [...state.tasks, createdTask] }));
    toast.success('Task created');
  },
  updateTask: async (id: string, updates: Partial<TaskModel>) => {
    const task = get().tasks.find((task) => task.id == id);
    if (!task) return;

    const updatedTask = Object.assign(new TaskModel(), { ...task, ...updates });
    updatedTask.updatedAt = new Date();

    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
    }));

    const fetchedTask = await updateTaskQuery(id, updatedTask);

    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? fetchedTask : task)),
    }));
  },
}));
