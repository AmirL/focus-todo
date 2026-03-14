import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth } from '@/shared/lib/api/api-route-wrapper';
import { serializeInitiative } from './serialize';
import {
  fetchTodayTomorrowInitiative,
  parseCreateInitiativeBody,
  createInitiative,
} from '@/shared/lib/api/initiative-helpers';

/**
 * GET /api/initiative - Get today's and tomorrow's initiative with balance data
 */
async function getHandler(_req: NextRequest, userId: string) {
  const { todayInitiative, tomorrowInitiative, suggestedList, balance, participatingLists } =
    await fetchTodayTomorrowInitiative(userId);

  return NextResponse.json(
    {
      today: todayInitiative ? serializeInitiative(todayInitiative) : null,
      tomorrow: tomorrowInitiative ? serializeInitiative(tomorrowInitiative) : null,
      suggestedList,
      balance,
      participatingLists: participatingLists.map((l) => ({
        id: l.id,
        name: l.name,
        participatesInInitiative: l.participatesInInitiative,
      })),
    },
    { status: 200 }
  );
}

interface CreateInitiativeBody {
  listId?: number;
  date?: string;
  reason?: string;
}

/**
 * POST /api/initiative - Set focus for a date
 *
 * Body: { listId: number, date?: string (YYYY-MM-DD), reason?: string }
 */
async function postHandler(req: NextRequest, userId: string) {
  const body = await req.json() as CreateInitiativeBody;
  const parsed = parseCreateInitiativeBody(body);

  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = await createInitiative(userId, parsed.listId!, parsed.date, parsed.reason);

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ initiative: serializeInitiative(result.initiative) }, { status: 201 });
}

export const GET = withApiAuth(getHandler, 'GET /api/initiative');
export const POST = withApiAuth(postHandler, 'POST /api/initiative');
