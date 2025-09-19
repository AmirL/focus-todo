import { TaskModel } from '@/entities/task/model/task';
import { StatusFilterEnum, useFilterStore } from '@/features/tasks/filter/model/filterStore';
import { useReorderStore } from '@/features/tasks/reorder';
import dayjs from 'dayjs';

export function useSortedTasks(tasks: TaskModel[]) {
  const statusFilter = useFilterStore((store) => store.statusFilter);
  const { optimisticTasks, isDragging } = useReorderStore();

  // Use optimistic tasks only during active dragging and only if they match current filter context
  const tasksToSort = (isDragging && optimisticTasks) ? optimisticTasks : tasks;

  switch (statusFilter) {
    case StatusFilterEnum.FUTURE:
      return sortTasksByDateWithManualOrder(tasksToSort);
    case StatusFilterEnum.SELECTED:
      return sortBlockerTasksBottomWithManualOrder(tasksToSort);
    default:
      return sortByManualOrder(tasksToSort);
  }
}

// Primary sort by date, secondary sort by manual order (sortOrder)
function sortTasksByDateWithManualOrder(tasks: TaskModel[]) {
  return [...tasks].sort((a, b) => {
    const dateDiff = unixTime(a.date) - unixTime(b.date);
    if (dateDiff !== 0) return dateDiff;
    // Secondary sort by manual order within same date
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });
}

// Primary sort by blocker status, secondary sort by manual order
function sortBlockerTasksBottomWithManualOrder(tasks: TaskModel[]) {
  return [...tasks].sort((a, b) => {
    const blockerDiff = Number(a.isBlocker) - Number(b.isBlocker);
    if (blockerDiff !== 0) return blockerDiff;
    // Secondary sort by manual order within same blocker status
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });
}

// Sort purely by manual order (for backlog and other contexts)
function sortByManualOrder(tasks: TaskModel[]) {
  return [...tasks].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

function unixTime(date: Date | null | undefined) {
  return date ? dayjs(date).unix() : 0;
}
