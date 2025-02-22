import { TaskModel } from '@/shared/model/task';
import { create } from 'zustand';
import toast from 'react-hot-toast';
import { createInstance } from '@/shared/lib/instance-tools';
import { createTaskQuery } from '../api/createTaskQuery';
import { fetchAllTasks } from '../api/fetchAllTasks';
import { updateTaskQuery } from '../api/updateTaskQuery';

type TasksState = {
  tasks: TaskModel[];
  isLoading: boolean;
  showTaskList: boolean;
  setShowTaskList: (show: boolean) => void;
  fetchTasks: () => Promise<void>;
  createTask: (task: TaskModel) => Promise<void>;
  updateTask: (id: string, updates: Partial<TaskModel>) => Promise<void>;
  createMultipleTasks: (todoTexts: string[], selectedList: string, isStarred: boolean) => Promise<void>;
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
  showTaskList: true,
  setShowTaskList: (show: boolean) => set({ showTaskList: show }),
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
  createMultipleTasks: async (todoTexts: string[], selectedList: string, isStarred: boolean) => {
    for (const text of todoTexts) {
      const newTask = createInstance(TaskModel, {
        name: text,
        list: selectedList,
        selectedAt: isStarred ? new Date() : null,
      });
      await get().createTask(newTask);
    }
  },
}));
