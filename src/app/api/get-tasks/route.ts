import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/lib/db';
import { tasksTable } from '@/lib/schema';
import { gt, isNull, lt, or } from 'drizzle-orm';
import dayjs from 'dayjs';

export async function POST(req: NextRequest) {
  await validateUserSession();

  const yesterday = dayjs().subtract(1, 'day').toDate();
  const tasks = await DB.select()
    .from(tasksTable)
    .where(or(isNull(tasksTable.deletedAt), gt(tasksTable.deletedAt, yesterday)));

  return NextResponse.json({ tasks }, { status: 200 });
}
