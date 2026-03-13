import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { timeEntriesTable } from '@/shared/lib/drizzle/schema';
import { withAuthAndErrorHandling, createSuccessResponse } from '@/shared/lib/api/route-wrapper';

async function getTimeEntriesHandler(_req: NextRequest, session: { user: { id: string } }) {
  const entries = await DB.select()
    .from(timeEntriesTable)
    .where(eq(timeEntriesTable.userId, session.user.id));

  return createSuccessResponse({ entries });
}

export const POST = withAuthAndErrorHandling(getTimeEntriesHandler, 'get-time-entries');
