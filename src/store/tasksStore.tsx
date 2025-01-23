import { Task } from '@/data-classes/task';
import { API } from '@/lib/api';
import { create } from 'zustand';
import toast from 'react-hot-toast';

type TasksState = {
  tasks: Task[];
  isLoading: boolean;
  createTaskInput: string;
  setCreateTaskInput: (input: string) => void;
  fetchTasks: () => Promise<void>;
  createTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
};

function syncTasks(existingTasks: Task[], fetchedTasks: Task[]): Task[] {
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
  createTaskInput: '',
  setCreateTaskInput: (input: string) => {
    set({ createTaskInput: input });
  },
  fetchTasks: async () => {
    console.log('fetching tasks');
    set({ isLoading: true });
    const data = await API.getTasks();
    const fetchedTasks = Task.fromPlainArray(data.tasks);

    set((state) => ({
      tasks: syncTasks(state.tasks, fetchedTasks),
      isLoading: false,
    }));
  },
  createTask: async (task: Task) => {
    const inputValue = get().createTaskInput;
    try {
      set({ createTaskInput: '' });
      const response = await API.createTask(task);
      const createdTask = Task.toInstance(response);
      set((state) => ({ tasks: [...state.tasks, createdTask] }));
      toast.success('Task created');
    } catch (error) {
      // error message was shown in the toast
      set({ createTaskInput: inputValue });
    }
  },
  updateTask: async (id: string, updates: Partial<Task>) => {
    const task = get().tasks.find((task) => task.id == id);
    if (!task) return;

    const updatedTask = Object.assign(new Task(), { ...task, ...updates });
    updatedTask.updatedAt = new Date();
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
