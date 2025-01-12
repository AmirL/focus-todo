import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/lib/db';
import { tasksTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  await validateUserSession();

  const { id, task } = await req.json();

  await DB.update(tasksTable).set(task).where(eq(tasksTable.id, id));
  const [updatedTask] = await DB.select().from(tasksTable).where(eq(tasksTable.id, id));

  return NextResponse.json(updatedTask, { status: 200 });
}
