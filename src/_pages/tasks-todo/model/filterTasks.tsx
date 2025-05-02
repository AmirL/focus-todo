import {
  TaskModel,
  isTaskDeleted,
  isTaskDeletedAgo,
  isTaskCompletedAgo,
  isTaskInBacklog,
  isTaskInFuture,
  isTaskSelected,
  isTaskToday,
  isTaskTomorrow,
} from '@/entities/task/model/task';
import { useFilterStore, StatusFilterEnum } from './filterStore';

export function useApplyFilters(tasks: TaskModel[]) {
  const { statusFilter, list } = useFilterStore();

  return tasks
    .filter((task) => !isTaskDeletedAgo(task) && !isTaskCompletedAgo(task))
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
      return isTaskSelected(task) && !isTaskToday(task) && !isTaskInFuture(task);
    case StatusFilterEnum.TODAY:
      return isTaskToday(task);
    case StatusFilterEnum.TOMORROW:
      return isTaskTomorrow(task);
  }
}
