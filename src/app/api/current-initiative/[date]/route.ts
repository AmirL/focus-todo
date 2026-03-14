import { NextRequest } from 'next/server';
import {
  withAuthAndErrorHandling,
  createSuccessResponse,
  createErrorResponse,
} from '@/shared/lib/api/route-wrapper';
import {
  toDate,
  isValidDate,
  findInitiativeByDate,
  updateInitiativeChoice,
  verifyListOwnership,
} from '@/shared/lib/api/initiative-helpers';
import { serializeInitiative } from '@/app/api/initiative/serialize';

type RouteContext = { params: Promise<{ date: string }> };

interface ChangeInitiativeBody {
  listId: number;
  reason?: string;
}

async function patchHandler(
  req: NextRequest,
  session: { user: { id: string } },
  context: RouteContext
) {
  const userId = session.user.id;
  const { date } = await context.params;

  if (!isValidDate(date)) {
    return createErrorResponse('Invalid date format. Use YYYY-MM-DD', 400);
  }

  const rawBody = await req.json() as Record<string, unknown>;

  if (!rawBody.listId || typeof rawBody.listId !== 'number' || !Number.isFinite(rawBody.listId)) {
    return createErrorResponse('listId must be a valid number', 400);
  }

  const body: ChangeInitiativeBody = {
    listId: rawBody.listId,
    reason: typeof rawBody.reason === 'string' ? rawBody.reason : undefined,
  };

  // Verify the list exists and belongs to the user
  const list = await verifyListOwnership(body.listId, userId);

  if (!list) {
    return createErrorResponse('List not found', 404);
  }

  const dateObj = toDate(date);

  // Find existing initiative for this date
  const existing = await findInitiativeByDate(userId, dateObj);

  if (!existing) {
    return createErrorResponse('No initiative found for this date. Use POST to create one.', 404);
  }

  // Update the initiative with the new choice
  const updated = await updateInitiativeChoice(
    userId,
    dateObj,
    body.listId,
    body.reason,
    existing.reason
  );

  return createSuccessResponse({ initiative: serializeInitiative(updated!) });
}

async function getHandler(
  _req: NextRequest,
  session: { user: { id: string } },
  context: RouteContext
) {
  const userId = session.user.id;
  const { date } = await context.params;

  if (!isValidDate(date)) {
    return createErrorResponse('Invalid date format. Use YYYY-MM-DD', 400);
  }

  const dateObj = toDate(date);
  const initiative = await findInitiativeByDate(userId, dateObj);

  if (!initiative) {
    return createErrorResponse('No initiative found for this date', 404);
  }

  return createSuccessResponse({ initiative: serializeInitiative(initiative) });
}

// The route wrapper doesn't pass context, so we capture it via closure
export function PATCH(req: NextRequest, context: RouteContext) {
  return withAuthAndErrorHandling(
    (r, s) => patchHandler(r, s, context),
    'PATCH /api/current-initiative/[date]'
  )(req);
}

export function GET(req: NextRequest, context: RouteContext) {
  return withAuthAndErrorHandling(
    (r, s) => getHandler(r, s, context),
    'GET /api/current-initiative/[date]'
  )(req);
}
