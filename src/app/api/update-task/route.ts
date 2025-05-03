import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { tasksTable } from '@/shared/lib/drizzle/migrations/schema';

export async function POST(req: NextRequest) {
  await validateUserSession();

  const { id, task } = await req.json();
  const { createdAt, ...taskWithoutCreatedAt } = task;

  await DB.update(tasksTable).set(taskWithoutCreatedAt).where(eq(tasksTable.id, id));
  const [updatedTask] = await DB.select().from(tasksTable).where(eq(tasksTable.id, id));

  return NextResponse.json(updatedTask, { status: 200 });
}
