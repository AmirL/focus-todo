import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { timeEntriesTable } from '@/shared/lib/drizzle/schema';

// POST - delete a time entry
export async function POST(req: NextRequest) {
  const session = await validateUserSession();
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  await DB.delete(timeEntriesTable)
    .where(and(eq(timeEntriesTable.id, id), eq(timeEntriesTable.userId, session.user.id)));

  return NextResponse.json({ success: true }, { status: 200 });
}
