import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq, isNull } from 'drizzle-orm';
import { goalsTable } from '@/shared/lib/drizzle/schema';
import { withAuthAndErrorHandling, createSuccessResponse } from '@/shared/lib/api/route-wrapper';

async function getGoalsHandler(_req: NextRequest, session: { user: { id: string } }) {
  const goals = await DB.select()
    .from(goalsTable)
    .where(and(eq(goalsTable.userId, session.user.id), isNull(goalsTable.deletedAt)));

  return createSuccessResponse({ goals });
}

export const POST = withAuthAndErrorHandling(getGoalsHandler, 'get-goals');
