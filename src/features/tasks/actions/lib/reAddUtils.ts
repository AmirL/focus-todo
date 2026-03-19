import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';
import type { TaskMetadata } from '@/shared/ui/task/useTaskMetadata';

/** Build a completed version of the original task (marks it as done) */
export function buildCompletedOriginalTask(task: TaskModel): TaskModel {
  return createInstance(TaskModel, {
    ...task,
    completedAt: new Date(),
    updatedAt: new Date(),
  });
}

/** Build a new task from form state for re-adding */
export function buildReAddedTask(
  name: string,
  details: string,
  metadata: TaskMetadata,
): TaskModel {
  return createInstance(TaskModel, {
    name,
    details: details.trim(),
    listId: metadata.selectedListId!,
    selectedAt: metadata.isStarred ? new Date() : null,
    isBlocker: metadata.isBlocker,
    date: metadata.selectedDate,
    estimatedDuration: metadata.selectedDuration ?? null,
  });
}
