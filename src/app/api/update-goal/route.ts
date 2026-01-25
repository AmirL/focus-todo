import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { goalsTable } from '@/shared/lib/drizzle/schema';
import { withAuthAndErrorHandling } from '@/shared/lib/api/route-wrapper';

export const POST = withAuthAndErrorHandling(async (req: NextRequest, session) => {
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
}, 'POST /api/update-goal');
