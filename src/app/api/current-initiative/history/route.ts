import { NextRequest } from 'next/server';
import {
  withAuthAndErrorHandling,
  createSuccessResponse,
} from '@/shared/lib/api/route-wrapper';
import { currentInitiativeTable } from '@/shared/lib/drizzle/schema';
import { calculateBalance } from '@/entities/current-initiative';
import { fetchInitiativeHistory } from '@/shared/lib/api/initiative-helpers';

type InitiativeRow = typeof currentInitiativeTable.$inferSelect;

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

  const { initiatives, listMap, balance, period } = await fetchInitiativeHistory(userId, days);

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

  const response: HistoryResponse = {
    initiatives: enrichedInitiatives,
    balance,
    period,
  };

  return createSuccessResponse(response, 200);
}

export const GET = withAuthAndErrorHandling(getHistoryHandler, 'GET /api/current-initiative/history');
