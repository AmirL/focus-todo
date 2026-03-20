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

/** Build initial metadata defaults from a task for re-add form */
export function buildReAddMetadataDefaults(
  task: TaskModel,
  initialDate: Date | null,
): Partial<TaskMetadata> {
  return {
    selectedDuration: task.estimatedDuration ?? null,
    selectedListId: task.listId,
    isStarred: !!task.selectedAt,
    isBlocker: !!task.isBlocker,
    selectedDate: initialDate ?? task.date ?? null,
  };
}

/** Get initial form values from a task for re-add */
export function getReAddFormDefaults(task: TaskModel): { name: string; details: string } {
  return {
    name: task.name,
    details: task.details ?? '',
  };
}

/** Check if re-add form can be submitted */
export function canSubmitReAdd(name: string): boolean {
  return name.trim().length > 0;
}
