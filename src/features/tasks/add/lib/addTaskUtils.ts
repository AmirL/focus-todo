import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';
import type { TaskMetadata } from '@/shared/ui/task/useTaskMetadata';
import dayjs from 'dayjs';

/** Status filter values that affect task defaults */
export type StatusFilter = 'today' | 'tomorrow' | 'selected' | 'all' | 'deleted';

/** Build a new task from form state */
export function buildNewTask(
  name: string,
  details: string,
  metadata: TaskMetadata,
): TaskModel {
  return createInstance(TaskModel, {
    name: name.trim(),
    details: details.trim(),
    listId: metadata.selectedListId!,
    selectedAt: metadata.isStarred ? new Date() : null,
    isBlocker: metadata.isBlocker,
    date: metadata.selectedDate,
    estimatedDuration: metadata.selectedDuration,
    goalId: metadata.selectedGoalId,
  });
}

/** Get metadata defaults based on the active status filter */
export function getStatusDefaults(statusFilter: StatusFilter): Partial<TaskMetadata> {
  switch (statusFilter) {
    case 'today':
      return { selectedDate: new Date() };
    case 'tomorrow':
      return { selectedDate: dayjs().add(1, 'day').toDate() };
    case 'selected':
      return { isStarred: true };
    default:
      return {};
  }
}

/** Validate that a task name is non-empty */
export function isValidTaskName(name: string): boolean {
  return name.trim().length > 0;
}

/** Build metadata overrides for add task dialog based on filters */
export function buildAddTaskMetadataOverrides(
  statusFilter: StatusFilter,
  listId: string | null,
): Partial<TaskMetadata> {
  const defaults = getStatusDefaults(statusFilter);
  if (listId) {
    defaults.selectedListId = Number(listId);
  }
  return defaults;
}
