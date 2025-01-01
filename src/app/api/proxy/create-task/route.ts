import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/lib/db';
import { tasksTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  await validateUserSession();

  const { task } = await req.json();

  const [{ id }] = await DB.insert(tasksTable).values(task).$returningId();
  const [createdTask] = await DB.select().from(tasksTable).where(eq(tasksTable.id, id));

  return NextResponse.json(createdTask, { status: 200 });
}
