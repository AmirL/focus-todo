import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth } from '@/shared/lib/api/api-route-wrapper';
import { serializeInitiativeWithLists } from '../serialize';
import { fetchInitiativeHistory } from '@/shared/lib/api/initiative-helpers';

/**
 * GET /api/initiative/history - Get initiative history with balance data
 *
 * Query params:
 *   - days: Number of days to look back (default: 30, max: 365)
 */
async function getHandler(req: NextRequest, userId: string) {
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

  return NextResponse.json(
    {
      initiatives: initiatives.map((i) => serializeInitiativeWithLists(i, listMap)),
      balance,
      period,
    },
    { status: 200 }
  );
}

export const GET = withApiAuth(getHandler, 'GET /api/initiative/history');
