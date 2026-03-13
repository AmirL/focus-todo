import { NextRequest } from 'next/server';
import {
  withAuthAndErrorHandling,
  createSuccessResponse,
  createErrorResponse,
} from '@/shared/lib/api/route-wrapper';
import { calculateBalance, type ListWithLastTouched } from '@/entities/current-initiative';
import {
  fetchTodayTomorrowInitiative,
  parseCreateInitiativeBody,
  createInitiative,
  type ListRow,
} from '@/shared/lib/api/initiative-helpers';

type InitiativeRow = Parameters<typeof createSuccessResponse>[0];

interface InitiativeResponse {
  today: unknown;
  tomorrow: unknown;
  suggestedList: ListWithLastTouched | null;
  balance: ReturnType<typeof calculateBalance>;
  participatingLists: ListRow[];
}

/**
 * GET /api/current-initiative
 * Returns today's and tomorrow's initiative, plus balance data and suggestion
 */
async function getInitiativeHandler(
  _req: NextRequest,
  session: { user: { id: string } }
) {
  const { todayInitiative, tomorrowInitiative, suggestedList, balance, participatingLists } =
    await fetchTodayTomorrowInitiative(session.user.id);

  const response: InitiativeResponse = {
    today: todayInitiative,
    tomorrow: tomorrowInitiative,
    suggestedList,
    balance,
    participatingLists,
  };

  return createSuccessResponse(response, 200);
}

/**
 * POST /api/current-initiative
 * Set tomorrow's focus. Creates a new initiative record for tomorrow.
 */
async function createInitiativeHandler(
  req: NextRequest,
  session: { user: { id: string } }
) {
  const body = await req.json() as Record<string, unknown>;
  const parsed = parseCreateInitiativeBody(body);

  if (parsed.error) {
    return createErrorResponse(parsed.error, 400);
  }

  const result = await createInitiative(
    session.user.id,
    parsed.listId!,
    parsed.date,
    parsed.reason,
  );

  if ('error' in result) {
    return createErrorResponse(result.error, result.status);
  }

  return createSuccessResponse({ initiative: result.initiative }, 201);
}

export const GET = withAuthAndErrorHandling(getInitiativeHandler, 'GET /api/current-initiative');
export const POST = withAuthAndErrorHandling(createInitiativeHandler, 'POST /api/current-initiative');
