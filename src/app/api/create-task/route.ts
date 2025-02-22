import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { tasksTable } from '@/shared/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  await validateUserSession();

  const { task } = await req.json();

  task.id = undefined;

  const [{ id }] = await DB.insert(tasksTable).values(task).$returningId();
  const [createdTask] = await DB.select().from(tasksTable).where(eq(tasksTable.id, id));

  return NextResponse.json(createdTask, { status: 200 });
}
