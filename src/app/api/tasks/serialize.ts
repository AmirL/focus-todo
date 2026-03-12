import { tasksTable } from '@/shared/lib/drizzle/schema';
import { toISOString } from '@/shared/lib/api/serialize-helpers';

export { handleApiError } from '@/shared/lib/api/serialize-helpers';

export type TaskRow = typeof tasksTable.$inferSelect;

export type ApiTask = Omit<
  TaskRow,
  'date' | 'completedAt' | 'deletedAt' | 'selectedAt' | 'updatedAt' | 'createdAt' | '__list_deprecated'
> & {
  date: string | null;
  completedAt: string | null;
  deletedAt: string | null;
  selectedAt: string | null;
  updatedAt: string | null;
  createdAt: string | null;
};

export type ApiTaskWithDescription = ApiTask & { listDescription: string | null };

export function serializeTask(t: TaskRow): ApiTask {
  const { __list_deprecated: _, ...rest } = t;
  return {
    ...rest,
    date: toISOString(t.date),
    completedAt: toISOString(t.completedAt),
    deletedAt: toISOString(t.deletedAt),
    selectedAt: toISOString(t.selectedAt),
    updatedAt: toISOString(t.updatedAt),
    createdAt: toISOString(t.createdAt),
  };
}

export function serializeTaskWithDescription(t: TaskRow, listDescription?: string | null): ApiTaskWithDescription {
  return {
    ...serializeTask(t),
    listDescription: listDescription ?? null,
  };
}
