import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { tasksTable } from '@/shared/lib/drizzle/schema';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';
import { withAuthAndErrorHandling } from '@/shared/lib/api/route-wrapper';

export const POST = withAuthAndErrorHandling(async (req: NextRequest, session) => {
  const { task } = await req.json();

  const processedTask = parseDateFields({
    ...task,
    createdAt: undefined,
    id: undefined,
    userId: session.user.id
  }, TaskDateKeys);

  const [{ id }] = await DB.insert(tasksTable).values(processedTask).$returningId();
  const [createdTask] = await DB.select().from(tasksTable).where(eq(tasksTable.id, id));

  return NextResponse.json(createdTask, { status: 200 });
}, 'POST /api/create-task');
