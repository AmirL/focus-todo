import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq, gte, lte, desc } from 'drizzle-orm';
import { currentInitiativeTable, listsTable } from '@/shared/lib/drizzle/schema';
import { getUserIdFromApiKey } from '@/app/api/api-auth';
import { calculateBalance } from '@/entities/current-initiative';
import { serializeInitiativeWithLists, handleApiError } from '../serialize';
import dayjs from 'dayjs';

function toDate(dateStr: string): Date {
  return dayjs(dateStr).toDate();
}

function formatDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * GET /api/initiative/history - Get initiative history with balance data
 *
 * Query params:
 *   - days: Number of days to look back (default: 30, max: 365)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromApiKey(req);

    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get('days');
    let days = 30;
    if (daysParam) {
      const parsed = parseInt(daysParam, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 365) {
        days = parsed;
      }
    }

    const todayStr = dayjs().format('YYYY-MM-DD');
    const startDateStr = dayjs().subtract(days, 'day').format('YYYY-MM-DD');
    const todayDate = toDate(todayStr);
    const startDate = toDate(startDateStr);

    // Get all lists for name lookup
    const lists = await DB.select()
      .from(listsTable)
      .where(eq(listsTable.userId, userId));

    const listMap = new Map(lists.map((l) => [l.id, l.name]));

    // Get initiatives for the period
    const initiatives = await DB.select()
      .from(currentInitiativeTable)
      .where(
        and(
          eq(currentInitiativeTable.userId, userId),
          gte(currentInitiativeTable.date, startDate),
          lte(currentInitiativeTable.date, todayDate)
        )
      )
      .orderBy(desc(currentInitiativeTable.date));

    // Calculate balance
    const participatingLists = lists.filter((l) => l.participatesInInitiative);
    const balance = calculateBalance(
      initiatives.map((i) => ({
        id: i.id,
        userId: i.userId,
        date: formatDate(i.date),
        suggestedListId: i.suggestedListId,
        chosenListId: i.chosenListId,
        reason: i.reason,
        setAt: i.setAt,
        changedAt: i.changedAt,
        getEffectiveListId: () => i.chosenListId ?? i.suggestedListId,
        wasChanged: () => i.chosenListId !== null && i.chosenListId !== i.suggestedListId,
      })),
      participatingLists.map((l) => ({ id: l.id, name: l.name }))
    );

    return NextResponse.json(
      {
        initiatives: initiatives.map((i) => serializeInitiativeWithLists(i, listMap)),
        balance,
        period: {
          startDate: startDateStr,
          endDate: todayStr,
          days,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'GET /api/initiative/history');
  }
}
