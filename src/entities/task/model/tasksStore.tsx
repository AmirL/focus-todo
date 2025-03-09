import { TaskModel } from '@/entities/task/model/task';
import { create } from 'zustand';
import { createInstance } from '@/shared/lib/instance-tools';

type TasksState = {
  tasks: TaskModel[];
  isLoading: boolean;
  showTaskList: boolean;
  setLoading: (loading: boolean) => void;
  setShowTaskList: (show: boolean) => void;
  syncTasks: (tasks: TaskModel[]) => void;
  addTask: (task: TaskModel) => void;
  updateTask: (id: string, updates: Partial<TaskModel>) => TaskModel;
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
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setShowTaskList: (show: boolean) => set({ showTaskList: show }),
  syncTasks: (fetchedTasks: TaskModel[]) => {
    set((state) => ({
      tasks: syncTasks(state.tasks, fetchedTasks),
    }));
  },
  addTask: (newTask: TaskModel) => {
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },
  updateTask: (id: string, updates: Partial<TaskModel>) => {
    const task = get().tasks.find((task) => task.id == id);
    if (!task) throw new Error('Task not found');

    const updatedTask = createInstance(TaskModel, { ...task, ...updates });
    updatedTask.updatedAt = new Date();

    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
    }));

    return updatedTask;
  },
}));
