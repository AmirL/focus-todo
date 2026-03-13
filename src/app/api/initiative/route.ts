import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/app/api/api-auth';
import { serializeInitiative, handleApiError } from './serialize';
import {
  fetchTodayTomorrowInitiative,
  parseCreateInitiativeBody,
  createInitiative,
} from '@/shared/lib/api/initiative-helpers';

/**
 * GET /api/initiative - Get today's and tomorrow's initiative with balance data
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await authenticateApiKey(req);

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
  } catch (error) {
    return handleApiError(error, 'GET /api/initiative');
  }
}

/**
 * POST /api/initiative - Set focus for a date
 *
 * Body: { listId: number, date?: string (YYYY-MM-DD), reason?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await authenticateApiKey(req);
    const body = await req.json() as Record<string, unknown>;
    const parsed = parseCreateInitiativeBody(body);

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const result = await createInitiative(userId, parsed.listId!, parsed.date, parsed.reason);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ initiative: serializeInitiative(result.initiative) }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST /api/initiative');
  }
}
