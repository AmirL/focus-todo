import { NextRequest } from 'next/server';
import {
  withAuthAndErrorHandling,
  createSuccessResponse,
} from '@/shared/lib/api/route-wrapper';
import { DB } from '@/shared/lib/db';
import { and, eq, gte, lte, desc } from 'drizzle-orm';
import { currentInitiativeTable, listsTable } from '@/shared/lib/drizzle/schema';
import { calculateBalance } from '@/entities/current-initiative';
import { toDate, getParticipatingLists, toBalanceEntries } from '@/shared/lib/api/initiative-helpers';
import dayjs from 'dayjs';

type InitiativeRow = typeof currentInitiativeTable.$inferSelect;
type ListRow = typeof listsTable.$inferSelect;

interface InitiativeWithList extends InitiativeRow {
  suggestedListName: string | null;
  chosenListName: string | null;
  effectiveListName: string | null;
}

interface HistoryResponse {
  initiatives: InitiativeWithList[];
  balance: ReturnType<typeof calculateBalance>;
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

/**
 * GET /api/current-initiative/history
 * Returns the last 30 days of initiatives with balance data
 *
 * Query params:
 *   - days: number of days to look back (default: 30, max: 365)
 */
async function getHistoryHandler(
  req: NextRequest,
  session: { user: { id: string } }
) {
  const userId = session.user.id;

  // Parse query params
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

  // Enrich initiatives with list names
  const enrichedInitiatives: InitiativeWithList[] = initiatives.map((i) => {
    const effectiveListId = i.chosenListId ?? i.suggestedListId;
    return {
      ...i,
      suggestedListName: i.suggestedListId ? listMap.get(i.suggestedListId) ?? null : null,
      chosenListName: i.chosenListId ? listMap.get(i.chosenListId) ?? null : null,
      effectiveListName: effectiveListId ? listMap.get(effectiveListId) ?? null : null,
    };
  });

  // Calculate balance
  const participatingLists = getParticipatingLists(lists);
  const balance = calculateBalance(
    toBalanceEntries(initiatives),
    participatingLists.map((l) => ({ id: l.id, name: l.name }))
  );

  const response: HistoryResponse = {
    initiatives: enrichedInitiatives,
    balance,
    period: {
      startDate: startDateStr,
      endDate: todayStr,
      days,
    },
  };

  return createSuccessResponse(response, 200);
}

export const GET = withAuthAndErrorHandling(getHistoryHandler, 'GET /api/current-initiative/history');
