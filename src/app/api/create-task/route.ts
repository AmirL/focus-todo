import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { tasksTable } from '@/shared/lib/drizzle/schema';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';

export async function POST(req: NextRequest) {
  await validateUserSession();

  const { task } = await req.json();

  const processedTask = parseDateFields({ ...task, createdAt: undefined, id: undefined }, TaskDateKeys);

  const [{ id }] = await DB.insert(tasksTable).values(processedTask).$returningId();
  const [createdTask] = await DB.select().from(tasksTable).where(eq(tasksTable.id, id));

  return NextResponse.json(createdTask, { status: 200 });
}
