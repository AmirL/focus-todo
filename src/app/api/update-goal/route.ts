import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { goalsTable } from '@/shared/lib/drizzle/schema';
import { withAuthAndErrorHandling, createErrorResponse, createSuccessResponse } from '@/shared/lib/api/route-wrapper';

async function updateGoalHandler(req: NextRequest, session: { user: { id: string } }) {
  const { id, goal } = await req.json();

  const goalData: {
    title?: string;
    description?: string;
    progress?: number;
    listId?: number;
    deletedAt?: Date | null;
  } = {};

  if (goal.title !== undefined) goalData.title = goal.title;
  if (goal.description !== undefined) goalData.description = goal.description;
  if (goal.progress !== undefined) goalData.progress = goal.progress;
  if (goal.listId !== undefined) goalData.listId = goal.listId;
  if (goal.deletedAt !== undefined) {
    goalData.deletedAt = goal.deletedAt ? new Date(goal.deletedAt) : null;
  }

  await DB.update(goalsTable)
    .set(goalData)
    .where(and(eq(goalsTable.id, id), eq(goalsTable.userId, session.user.id)));

  const [updatedGoal] = await DB.select()
    .from(goalsTable)
    .where(and(eq(goalsTable.id, id), eq(goalsTable.userId, session.user.id)));

  if (!updatedGoal) {
    return createErrorResponse('Goal not found', 404);
  }

  return createSuccessResponse(updatedGoal);
}

export const POST = withAuthAndErrorHandling(updateGoalHandler, 'update-goal');
