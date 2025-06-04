import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { goalsTable } from '@/shared/lib/drizzle/schema';

export async function POST(req: NextRequest) {
  await validateUserSession();

  const { id, goal } = await req.json();

  await DB.update(goalsTable).set(goal).where(eq(goalsTable.id, id));
  const [updatedGoal] = await DB.select().from(goalsTable).where(eq(goalsTable.id, id));

  return NextResponse.json(updatedGoal, { status: 200 });
}
