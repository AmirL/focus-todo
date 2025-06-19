import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { tasksTable } from '@/shared/lib/drizzle/schema';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';

export async function POST(req: NextRequest) {
  const session = await validateUserSession();

  const { id, task } = await req.json();

  const processedTask = parseDateFields({ ...task, createdAt: undefined }, TaskDateKeys);

  await DB.update(tasksTable)
    .set(processedTask)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, session.user.id)));
    
  const [updatedTask] = await DB.select()
    .from(tasksTable)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, session.user.id)));

  return NextResponse.json(updatedTask, { status: 200 });
}
