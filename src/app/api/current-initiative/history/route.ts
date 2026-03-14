import { NextRequest } from 'next/server';
import {
  withAuthAndErrorHandling,
  createSuccessResponse,
} from '@/shared/lib/api/route-wrapper';
import { fetchInitiativeHistory } from '@/shared/lib/api/initiative-helpers';
import { serializeInitiativeWithLists } from '@/app/api/initiative/serialize';

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

  return createSuccessResponse({
    initiatives: initiatives.map((i) => serializeInitiativeWithLists(i, listMap)),
    balance,
    period,
  }, 200);
}

export const GET = withAuthAndErrorHandling(getHistoryHandler, 'GET /api/current-initiative/history');
