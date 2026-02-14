import { NextRequest } from 'next/server';
import { withAuthAndErrorHandling, createSuccessResponse, createErrorResponse, AuthenticatedSession } from '@/shared/lib/api/route-wrapper';
import { DB } from '@/shared/lib/db';
import { and, eq, asc } from 'drizzle-orm';
import { goalMilestonesTable, goalsTable } from '@/shared/lib/drizzle/schema';

async function handler(req: NextRequest, session: AuthenticatedSession) {
  const { goalId } = await req.json();

  const [goal] = await DB.select()
    .from(goalsTable)
    .where(and(eq(goalsTable.id, goalId), eq(goalsTable.userId, session.user.id)));

  if (!goal) {
    return createErrorResponse('Goal not found', 404);
  }

  const milestones = await DB.select()
    .from(goalMilestonesTable)
    .where(eq(goalMilestonesTable.goalId, goalId))
    .orderBy(asc(goalMilestonesTable.createdAt));

  return createSuccessResponse({ milestones });
}

export const POST = withAuthAndErrorHandling(handler, 'get-goal-milestones');
