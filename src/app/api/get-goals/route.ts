import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { and, eq, isNull } from 'drizzle-orm';
import { goalsTable } from '@/shared/lib/drizzle/schema';

export async function POST(req: NextRequest) {
  const session = await validateUserSession();

  const goals = await DB.select()
    .from(goalsTable)
    .where(and(eq(goalsTable.userId, session.user.id), isNull(goalsTable.deletedAt)));

  return NextResponse.json({ goals }, { status: 200 });
}
