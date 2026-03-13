import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { tasksTable } from '@/shared/lib/drizzle/schema';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';

export async function POST(req: NextRequest) {
  const session = await validateUserSession();

  const { task } = await req.json();

  const taskWithParsedDates = parseDateFields({
    ...task,
    __list_deprecated: '',
    createdAt: undefined,
    id: undefined,
    userId: session.user.id
  }, TaskDateKeys);

  const [{ id }] = await DB.insert(tasksTable).values(taskWithParsedDates).$returningId();
  const [createdTask] = await DB.select().from(tasksTable).where(eq(tasksTable.id, id));

  return NextResponse.json(createdTask, { status: 200 });
}
