import { NextResponse } from 'next/server';
import { tasksTable } from '@/shared/lib/drizzle/schema';

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

export function toISOString(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

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

export function handleApiError(error: unknown, operation: string) {
  const msg = error instanceof Error ? error.message : 'Unknown error occurred';
  const lower = msg.toLowerCase();
  const isAuth = lower.includes('api key required') || lower.includes('invalid or revoked api key');
  const status = isAuth ? 401 : 500;
  if (!isAuth) {
    console.error(`Error in ${operation}:`, error);
  }
  return NextResponse.json({ error: msg }, { status });
}
