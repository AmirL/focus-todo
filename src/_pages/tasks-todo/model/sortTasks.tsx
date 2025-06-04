import { TaskModel } from '@/entities/task/model/task';
import { StatusFilterEnum, useFilterStore } from '@/features/tasks/filter/model/filterStore';
import dayjs from 'dayjs';

export function useSortedTasks(tasks: TaskModel[]) {
  const statusFilter = useFilterStore((store) => store.statusFilter);

  switch (statusFilter) {
    case StatusFilterEnum.FUTURE:
      return sortTasksByDate(tasks);
    case StatusFilterEnum.SELECTED:
      return sortBlockerTasksBottom(tasks);
    default:
      return tasks;
  }
}

function sortTasksByDate(tasks: TaskModel[]) {
  return [...tasks].sort((a, b) => unixTime(a.date) - unixTime(b.date));
}

function unixTime(date: Date | null | undefined) {
  return date ? dayjs(date).unix() : 0;
}

function sortBlockerTasksBottom(tasks: TaskModel[]) {
  return [...tasks].sort((a, b) => Number(a.isBlocker) - Number(b.isBlocker));
}
