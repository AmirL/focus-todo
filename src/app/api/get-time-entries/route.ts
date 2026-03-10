import { NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { timeEntriesTable } from '@/shared/lib/drizzle/schema';

// POST - list all time entries for the current user (internal session-based route)
export async function POST() {
  const session = await validateUserSession();

  const entries = await DB.select()
    .from(timeEntriesTable)
    .where(eq(timeEntriesTable.userId, session.user.id));

  return NextResponse.json({ entries }, { status: 200 });
}
