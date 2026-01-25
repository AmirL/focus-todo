import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { tasksTable } from '@/shared/lib/drizzle/schema';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';
import { withAuthAndErrorHandling } from '@/shared/lib/api/route-wrapper';

export const POST = withAuthAndErrorHandling(async (req: NextRequest, session) => {
  const { id, task } = await req.json();

  const processedTask = parseDateFields({ ...task, createdAt: undefined }, TaskDateKeys);

  await DB.update(tasksTable)
    .set(processedTask)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, session.user.id)));

  const [updatedTask] = await DB.select()
    .from(tasksTable)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, session.user.id)));

  return NextResponse.json(updatedTask, { status: 200 });
}, 'POST /api/update-task');
