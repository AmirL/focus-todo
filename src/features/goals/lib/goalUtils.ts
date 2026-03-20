import dayjs from 'dayjs';
import { GoalModel } from '@/entities/goal';
import { createInstance } from '@/shared/lib/instance-tools';

/** Format a milestone date for display */
export function formatMilestoneDate(dateValue: string): string {
  const date = dayjs(dateValue);
  const today = dayjs();
  const yesterday = today.subtract(1, 'day');

  if (date.isSame(today, 'day')) {
    return 'Today';
  }
  if (date.isSame(yesterday, 'day')) {
    return 'Yesterday';
  }
  return date.format('MMM D, YYYY');
}

/** Build a new goal from form data */
export function buildNewGoal(
  title: string,
  description: string,
  progress: number,
  listId: number,
): GoalModel {
  return createInstance(GoalModel, { title, description, progress, listId });
}

/** Build an updated goal from form data */
export function buildUpdatedGoal(
  goal: GoalModel,
  title: string,
  description: string,
  progress: number,
): GoalModel {
  return createInstance(GoalModel, { ...goal, title, progress, description });
}

/** Build a soft-deleted goal */
export function buildDeletedGoal(goal: GoalModel): GoalModel {
  return createInstance(GoalModel, { ...goal, deletedAt: new Date().toISOString() });
}

/** Validate milestone description is non-empty */
export function isValidMilestoneDescription(description: string): boolean {
  return description.trim().length > 0;
}

/** Build a new milestone payload */
export function buildMilestonePayload(
  goalId: string,
  progress: number,
  description: string,
): { goalId: string; progress: number; description: string } {
  return { goalId, progress, description: description.trim() };
}
