import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';
import type { TaskMetadata } from '@/shared/ui/task/useTaskMetadata';
import type { AiSuggestions } from '@/shared/types/aiSuggestions';

export interface EditTaskFormState {
  name: string;
  details: string;
  metadata: TaskMetadata;
  aiSuggestions: AiSuggestions | null;
}

/** Build an updated task from form state for saving */
export function buildUpdatedTask(task: TaskModel, formState: EditTaskFormState): TaskModel {
  return createInstance(TaskModel, {
    ...task,
    name: formState.name,
    details: formState.details,
    estimatedDuration: formState.metadata.selectedDuration,
    listId: formState.metadata.selectedListId!,
    selectedAt: formState.metadata.isStarred ? task.selectedAt || new Date() : null,
    isBlocker: formState.metadata.isBlocker,
    date: formState.metadata.selectedDate,
    goalId: formState.metadata.selectedGoalId,
    aiSuggestions: formState.aiSuggestions,
    updatedAt: new Date(),
  });
}

/** Build an updated task with cleared AI suggestions */
export function buildTaskWithClearedSuggestions(task: TaskModel, formState: Omit<EditTaskFormState, 'aiSuggestions'>): TaskModel {
  return buildUpdatedTask(task, { ...formState, aiSuggestions: null });
}

/** Apply an accepted AI suggestion to the form state, returning updated values */
export function applySuggestion(
  aiSuggestions: AiSuggestions | null,
  fieldName: string,
): {
  updatedSuggestions: AiSuggestions | null;
  appliedValue: string | null;
  appliedDuration: number | null;
} {
  if (!aiSuggestions?.[fieldName]) {
    return { updatedSuggestions: aiSuggestions, appliedValue: null, appliedDuration: null };
  }

  const suggestion = aiSuggestions[fieldName].suggestion;
  let appliedValue: string | null = null;
  let appliedDuration: number | null = null;

  if (fieldName === 'name' || fieldName === 'details') {
    appliedValue = suggestion;
  } else if (fieldName === 'estimatedDuration') {
    const parsed = parseInt(suggestion, 10);
    if (!isNaN(parsed)) {
      appliedDuration = parsed;
    }
  }

  const updatedSuggestions: AiSuggestions = {
    ...aiSuggestions,
    [fieldName]: { ...aiSuggestions[fieldName], userReaction: 'accepted' as const },
  };

  return { updatedSuggestions, appliedValue, appliedDuration };
}

/** Mark a suggestion as rejected */
export function rejectSuggestion(
  aiSuggestions: AiSuggestions | null,
  fieldName: string,
): AiSuggestions | null {
  if (!aiSuggestions?.[fieldName]) return aiSuggestions;
  return {
    ...aiSuggestions,
    [fieldName]: { ...aiSuggestions[fieldName], userReaction: 'rejected' as const },
  };
}

/** Build initial metadata defaults from a task for edit form */
export function buildEditMetadataDefaults(task: TaskModel): Partial<TaskMetadata> {
  return {
    selectedDuration: task.estimatedDuration ?? null,
    selectedListId: task.listId,
    isStarred: !!task.selectedAt,
    isBlocker: task.isBlocker,
    selectedDate: task.date ?? null,
    selectedGoalId: task.goalId ?? null,
  };
}

/** Get initial form values from a task for edit */
export function getEditFormDefaults(task: TaskModel): {
  name: string;
  details: string;
  aiSuggestions: AiSuggestions | null;
} {
  return {
    name: task.name,
    details: task.details ?? '',
    aiSuggestions: task.aiSuggestions ?? null,
  };
}
