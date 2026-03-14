import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { goalsTable } from '@/shared/lib/drizzle/schema';
import { withAuthAndErrorHandling, createSuccessResponse, createErrorResponse } from '@/shared/lib/api/route-wrapper';

async function createGoalHandler(req: NextRequest, session: { user: { id: string } }) {
  const { goal } = await req.json();

  if (!goal?.title || typeof goal.title !== 'string' || goal.title.trim() === '') {
    return createErrorResponse('Goal title is required');
  }

  if (!goal?.listId || typeof goal.listId !== 'number') {
    return createErrorResponse('Goal listId is required (number)');
  }

  const goalWithUser = { ...goal, userId: session.user.id };

  const [{ id }] = await DB.insert(goalsTable).values(goalWithUser).$returningId();
  const [createdGoal] = await DB.select().from(goalsTable).where(eq(goalsTable.id, id));

  return createSuccessResponse(createdGoal);
}

export const POST = withAuthAndErrorHandling(createGoalHandler, 'create-goal');
