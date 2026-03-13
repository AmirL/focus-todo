import { NextRequest } from 'next/server';
import { withAuthAndErrorHandling, createSuccessResponse, createErrorResponse, AuthenticatedSession } from '@/shared/lib/api/route-wrapper';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { goalMilestonesTable, goalsTable } from '@/shared/lib/drizzle/schema';

async function createGoalMilestoneHandler(req: NextRequest, session: AuthenticatedSession) {
  const { goalId, progress, description } = await req.json();

  const [goal] = await DB.select()
    .from(goalsTable)
    .where(and(eq(goalsTable.id, goalId), eq(goalsTable.userId, session.user.id)));

  if (!goal) {
    return createErrorResponse('Goal not found', 404);
  }

  const [{ id }] = await DB.insert(goalMilestonesTable)
    .values({ goalId, progress, description })
    .$returningId();

  await DB.update(goalsTable)
    .set({ progress })
    .where(eq(goalsTable.id, goalId));

  const [milestone] = await DB.select()
    .from(goalMilestonesTable)
    .where(eq(goalMilestonesTable.id, id));

  const [updatedGoal] = await DB.select()
    .from(goalsTable)
    .where(eq(goalsTable.id, goalId));

  return createSuccessResponse({ milestone, goal: updatedGoal });
}

export const POST = withAuthAndErrorHandling(createGoalMilestoneHandler, 'create-goal-milestone');
