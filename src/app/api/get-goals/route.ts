import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { isNull } from 'drizzle-orm';
import { goalsTable } from '@/shared/lib/drizzle/migrations/schema';

export async function POST(req: NextRequest) {
  await validateUserSession();

  const goals = await DB.select().from(goalsTable).where(isNull(goalsTable.deletedAt));

  return NextResponse.json({ goals }, { status: 200 });
}
