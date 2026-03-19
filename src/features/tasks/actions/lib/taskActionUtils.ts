import { TaskModel, isTaskDeleted, isTaskSelected } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';

/** Build a task with toggled blocker status */
export function buildToggledBlockerTask(task: TaskModel): TaskModel {
  return createInstance(TaskModel, { ...task, isBlocker: !task.isBlocker, updatedAt: new Date() });
}

/** Build a task with toggled star (selectedAt) status */
export function buildToggledStarTask(task: TaskModel): TaskModel {
  const selectedAt = isTaskSelected(task) ? null : new Date();
  return createInstance(TaskModel, { ...task, selectedAt, updatedAt: new Date() });
}

/** Build a task with toggled soft-delete status */
export function buildToggledDeleteTask(task: TaskModel): TaskModel {
  const deletedAt = isTaskDeleted(task) ? null : new Date();
  return createInstance(TaskModel, { ...task, deletedAt, updatedAt: new Date() });
}

/** Build a task with an updated snooze date */
export function buildSnoozedTask(task: TaskModel, date: Date | null): TaskModel {
  return createInstance(TaskModel, { ...task, date, updatedAt: new Date() });
}

/** Build a task with an updated estimated duration */
export function buildDurationChangedTask(task: TaskModel, minutes: number | null): TaskModel {
  return createInstance(TaskModel, { ...task, estimatedDuration: minutes, updatedAt: new Date() });
}
