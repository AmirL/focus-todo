import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { timeEntriesTable } from '@/shared/lib/drizzle/schema';
import dayjs from 'dayjs';
import { withAuthAndErrorHandling, createErrorResponse, createSuccessResponse } from '@/shared/lib/api/route-wrapper';

async function updateTimeEntryHandler(req: NextRequest, session: { user: { id: string } }) {
  const { id, startedAt, endedAt } = await req.json();

  if (!id) {
    return createErrorResponse('id is required', 400);
  }

  const [existing] = await DB.select()
    .from(timeEntriesTable)
    .where(and(eq(timeEntriesTable.id, id), eq(timeEntriesTable.userId, session.user.id)));

  if (!existing) {
    return createErrorResponse('Time entry not found', 404);
  }

  const updateData: Record<string, unknown> = {};

  if (startedAt) {
    updateData.startedAt = new Date(startedAt);
  }
  if (endedAt) {
    updateData.endedAt = new Date(endedAt);
  }

  const finalStart = startedAt ? dayjs(startedAt) : dayjs(existing.startedAt);
  const finalEnd = endedAt ? dayjs(endedAt) : existing.endedAt ? dayjs(existing.endedAt) : null;

  if (finalEnd) {
    updateData.durationMinutes = Math.max(Math.round(finalEnd.diff(finalStart, 'minute', true)), 1);
  }

  await DB.update(timeEntriesTable)
    .set(updateData)
    .where(and(eq(timeEntriesTable.id, id), eq(timeEntriesTable.userId, session.user.id)));

  const [updated] = await DB.select()
    .from(timeEntriesTable)
    .where(eq(timeEntriesTable.id, id));

  return createSuccessResponse(updated);
}

export const POST = withAuthAndErrorHandling(updateTimeEntryHandler, 'update-time-entry');
