import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq, gt, isNull, or } from 'drizzle-orm';
import dayjs from 'dayjs';
import { tasksTable } from '@/shared/lib/drizzle/schema';
import { withAuthAndErrorHandling, createSuccessResponse } from '@/shared/lib/api/route-wrapper';

async function getTasksHandler(_req: NextRequest, session: { user: { id: string } }) {
  const yesterday = dayjs().subtract(1, 'day').toDate();
  const tasks = await DB.select()
    .from(tasksTable)
    .where(and(
      eq(tasksTable.userId, session.user.id),
      or(isNull(tasksTable.deletedAt), gt(tasksTable.deletedAt, yesterday))
    ));

  return createSuccessResponse({ tasks });
}

export const POST = withAuthAndErrorHandling(getTasksHandler, 'get-tasks');
