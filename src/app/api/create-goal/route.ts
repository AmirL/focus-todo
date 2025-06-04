import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { goalsTable } from '@/shared/lib/drizzle/schema';

export async function POST(req: NextRequest) {
  await validateUserSession();

  const { goal } = await req.json();

  const [{ id }] = await DB.insert(goalsTable).values(goal).returning({ id: goalsTable.id });
  const [createdGoal] = await DB.select().from(goalsTable).where(eq(goalsTable.id, id));

  return NextResponse.json(createdGoal, { status: 200 });
}
