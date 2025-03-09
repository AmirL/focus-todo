import {
  TaskModel,
  isTaskDeleted,
  isTaskCompletedAgo,
  isTaskActive,
  isTaskInFuture,
  isTaskSelected,
} from '@/entities/task/model/task';
import dayjs from 'dayjs';
import { useFilterStore, StatusFilterEnum } from './filterStore';

export function useSortedTasks(tasks: TaskModel[]) {
  const statusFilter = useFilterStore((store) => store.statusFilter);

  return statusFilter == StatusFilterEnum.FUTURE ? sortTasksByDate(tasks) : tasks;
}
function sortTasksByDate(tasks: TaskModel[]) {
  return tasks.sort((a, b) => unixTime(a.date) - unixTime(b.date));
}
function unixTime(date: Date | null | undefined) {
  return date ? dayjs(date).unix() : 0;
}

export function useApplyFilters(tasks: TaskModel[]) {
  const { statusFilter, list } = useFilterStore();

  return tasks
    .filter((task) => !isTaskDeleted(task) && !isTaskCompletedAgo(task))
    .filter((task) => applyStatusFilter(task, statusFilter))
    .filter((task) => list === '' || task.list === list);
}
function applyStatusFilter(task: TaskModel, filter: StatusFilterEnum) {
  switch (filter) {
    case StatusFilterEnum.ACTIVE:
      return isTaskActive(task);
    case StatusFilterEnum.FUTURE:
      return isTaskInFuture(task);
    case StatusFilterEnum.SELECTED:
      return isTaskSelected(task);
  }
}
