import { NextResponse } from 'next/server';
import { listsTable } from '@/shared/lib/drizzle/schema';

export type ListRow = typeof listsTable.$inferSelect;

export type ApiList = Omit<ListRow, 'createdAt' | 'updatedAt' | 'archivedAt'> & {
  createdAt: string | null;
  updatedAt: string | null;
  archivedAt: string | null;
};

function toISOString(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function serializeList(l: ListRow): ApiList {
  return {
    ...l,
    createdAt: toISOString(l.createdAt),
    updatedAt: toISOString(l.updatedAt),
    archivedAt: toISOString(l.archivedAt),
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
