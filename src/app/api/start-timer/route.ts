import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { timeEntriesTable } from '@/shared/lib/drizzle/schema';
import dayjs from 'dayjs';
import { stopRunningTimers } from '../timer-helpers';
import { withAuthAndErrorHandling, createErrorResponse, createSuccessResponse } from '@/shared/lib/api/route-wrapper';

async function startTimerHandler(req: NextRequest, session: { user: { id: string } }) {
  const { taskId } = await req.json();

  if (!taskId) {
    return createErrorResponse('taskId is required', 400);
  }

  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  await stopRunningTimers(session.user.id);

  const [{ id }] = await DB.insert(timeEntriesTable).values({
    taskId: Number(taskId),
    userId: session.user.id,
    startedAt: new Date(now),
  }).$returningId();

  const [created] = await DB.select()
    .from(timeEntriesTable)
    .where(eq(timeEntriesTable.id, id));

  return createSuccessResponse(created);
}

export const POST = withAuthAndErrorHandling(startTimerHandler, 'start-timer');
