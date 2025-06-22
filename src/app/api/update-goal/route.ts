import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { goalsTable } from '@/shared/lib/drizzle/schema';

export async function POST(req: NextRequest) {
  const session = await validateUserSession();

  const { id, goal } = await req.json();

  // Convert deletedAt string to Date object if present
  const goalData = { ...goal };
  if (goalData.deletedAt && typeof goalData.deletedAt === 'string') {
    goalData.deletedAt = new Date(goalData.deletedAt);
  }

  await DB.update(goalsTable)
    .set(goalData)
    .where(and(eq(goalsTable.id, id), eq(goalsTable.userId, session.user.id)));
    
  const [updatedGoal] = await DB.select()
    .from(goalsTable)
    .where(and(eq(goalsTable.id, id), eq(goalsTable.userId, session.user.id)));

  return NextResponse.json(updatedGoal, { status: 200 });
}
