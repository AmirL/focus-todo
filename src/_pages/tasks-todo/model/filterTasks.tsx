import {
  TaskModel,
  isTaskDeleted,
  isTaskCompletedAgo,
  isTaskInBacklog,
  isTaskInFuture,
  isTaskSelected,
  isTaskToday,
} from '@/entities/task/model/task';
import { useFilterStore, StatusFilterEnum } from './filterStore';

export function useApplyFilters(tasks: TaskModel[]) {
  const { statusFilter, list } = useFilterStore();

  return tasks
    .filter((task) => !isTaskDeleted(task) && !isTaskCompletedAgo(task))
    .filter((task) => applyStatusFilter(task, statusFilter))
    .filter((task) => list === '' || task.list === list);
}
function applyStatusFilter(task: TaskModel, filter: StatusFilterEnum) {
  switch (filter) {
    case StatusFilterEnum.BACKLOG:
      return isTaskInBacklog(task);
    case StatusFilterEnum.FUTURE:
      return isTaskInFuture(task);
    case StatusFilterEnum.SELECTED:
      return isTaskSelected(task);
    case StatusFilterEnum.TODAY:
      return isTaskToday(task);
  }
}
