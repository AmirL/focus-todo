import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/lib/db';
import { tasksTable } from '@/lib/schema';

export async function POST(req: NextRequest) {
  await validateUserSession();

  const tasks = await DB.select().from(tasksTable);

  return NextResponse.json({ tasks }, { status: 200 });
}
