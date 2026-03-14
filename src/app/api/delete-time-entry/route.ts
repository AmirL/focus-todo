import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { timeEntriesTable } from '@/shared/lib/drizzle/schema';
import { withAuthAndErrorHandling, createErrorResponse, createSuccessResponse } from '@/shared/lib/api/route-wrapper';

async function deleteTimeEntryHandler(req: NextRequest, session: { user: { id: string } }) {
  const { id } = await req.json();

  if (!id) {
    return createErrorResponse('id is required', 400);
  }

  await DB.delete(timeEntriesTable)
    .where(and(eq(timeEntriesTable.id, id), eq(timeEntriesTable.userId, session.user.id)));

  return createSuccessResponse({ success: true });
}

export const POST = withAuthAndErrorHandling(deleteTimeEntryHandler, 'delete-time-entry');
