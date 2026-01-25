import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { goalsTable } from '@/shared/lib/drizzle/schema';
import { withAuthAndErrorHandling } from '@/shared/lib/api/route-wrapper';

export const POST = withAuthAndErrorHandling(async (req: NextRequest, session) => {
  const { goal } = await req.json();

  const goalWithUser = { ...goal, userId: session.user.id };

  const [{ id }] = await DB.insert(goalsTable).values(goalWithUser).$returningId();
  const [createdGoal] = await DB.select().from(goalsTable).where(eq(goalsTable.id, id));

  return NextResponse.json(createdGoal, { status: 200 });
}, 'POST /api/create-goal');
