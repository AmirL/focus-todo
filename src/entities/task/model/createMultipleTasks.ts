import { createInstance } from '@/shared/lib/instance-tools';
import { TaskModel } from '@/entities/task/model/task';
import { useTasksStore } from './tasksStore';
import { useCallback } from 'react';

export function useCreateMultipleTasks() {
  const createTask = useTasksStore((state) => state.createTask);

  const createTasks = useCallback(
    async (todoTexts: string[], selectedList: string, isStarred: boolean) => {
      for (const text of todoTexts) {
        const newTask = createInstance(TaskModel, {
          name: text,
          list: selectedList,
          selectedAt: isStarred ? new Date() : null,
        });
        await createTask(newTask);
      }
    },
    [createTask]
  );

  return createTasks;
}
