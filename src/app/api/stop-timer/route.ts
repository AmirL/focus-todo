import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq, isNull } from 'drizzle-orm';
import { timeEntriesTable } from '@/shared/lib/drizzle/schema';
import { stopRunningTimers } from '../timer-helpers';
import { withAuthAndErrorHandling, createErrorResponse, createSuccessResponse } from '@/shared/lib/api/route-wrapper';

async function stopTimerHandler(_req: NextRequest, session: { user: { id: string } }) {
  const [running] = await DB.select()
    .from(timeEntriesTable)
    .where(and(
      eq(timeEntriesTable.userId, session.user.id),
      isNull(timeEntriesTable.endedAt)
    ));

  if (!running) {
    return createErrorResponse('No running timer', 404);
  }

  await stopRunningTimers(session.user.id);

  const [stopped] = await DB.select()
    .from(timeEntriesTable)
    .where(eq(timeEntriesTable.id, running.id));

  return createSuccessResponse(stopped);
}

export const POST = withAuthAndErrorHandling(stopTimerHandler, 'stop-timer');
