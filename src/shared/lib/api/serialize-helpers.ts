import { NextResponse } from 'next/server';
import { ApiAuthError } from '@/app/api/api-auth';

export function toISOString(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function handleApiError(error: unknown, operation: string) {
  const msg = error instanceof Error ? error.message : 'Unknown error occurred';
  const isAuth = error instanceof ApiAuthError;
  const status = isAuth ? 401 : 500;
  if (!isAuth) {
    console.error(`Error in ${operation}:`, error);
  }
  return NextResponse.json({ error: msg }, { status });
}
