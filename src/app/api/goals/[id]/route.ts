import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { goalsTable } from '@/shared/lib/drizzle/schema';
import { getUserIdFromApiKey } from '@/app/api/api-auth';
import dayjs from 'dayjs';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * DELETE /api/goals/:id - Soft delete a goal
 *
 * Query params:
 *   - permanent=true: Hard delete (permanent removal)
 *
 * Returns: Success message
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserIdFromApiKey(req);
    const { id } = await context.params;
    const goalId = parseInt(id, 10);

    if (isNaN(goalId)) {
      return NextResponse.json({ error: 'Invalid goal ID' }, { status: 400 });
    }

    const [existingGoal] = await DB.select()
      .from(goalsTable)
      .where(
        and(
          eq(goalsTable.id, goalId),
          eq(goalsTable.userId, userId)
        )
      );

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      await DB.delete(goalsTable)
        .where(and(eq(goalsTable.id, goalId), eq(goalsTable.userId, userId)));

      return NextResponse.json({ message: 'Goal permanently deleted' }, { status: 200 });
    } else {
      await DB.update(goalsTable)
        .set({ deletedAt: dayjs().toDate() })
        .where(and(eq(goalsTable.id, goalId), eq(goalsTable.userId, userId)));

      return NextResponse.json({ message: 'Goal deleted' }, { status: 200 });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error occurred';
    const lower = msg.toLowerCase();
    const isAuth = lower.includes('api key required') || lower.includes('invalid or revoked api key');
    const status = isAuth ? 401 : 500;
    if (!isAuth) {
      console.error('Error in DELETE /api/goals/:id:', error);
    }
    return NextResponse.json({ error: msg }, { status });
  }
}
