import { NextRequest } from 'next/server';
import {
  withAuthAndErrorHandling,
  createSuccessResponse,
  createErrorResponse,
} from '@/shared/lib/api/route-wrapper';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { currentInitiativeTable, listsTable } from '@/shared/lib/drizzle/schema';
import { toDate } from '@/shared/lib/api/initiative-helpers';
import dayjs from 'dayjs';

type RouteContext = { params: Promise<{ date: string }> };

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && dayjs(dateStr, 'YYYY-MM-DD', true).isValid();
}

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
  const [list] = await DB.select()
    .from(listsTable)
    .where(
      and(
        eq(listsTable.id, body.listId),
        eq(listsTable.userId, userId)
      )
    );

  if (!list) {
    return createErrorResponse('List not found', 404);
  }

  const dateObj = toDate(date);

  // Find existing initiative for this date
  const [existing] = await DB.select()
    .from(currentInitiativeTable)
    .where(
      and(
        eq(currentInitiativeTable.userId, userId),
        eq(currentInitiativeTable.date, dateObj)
      )
    );

  if (!existing) {
    return createErrorResponse('No initiative found for this date. Use POST to create one.', 404);
  }

  // Update the initiative with the new choice
  await DB.update(currentInitiativeTable)
    .set({
      chosenListId: body.listId,
      reason: body.reason ?? existing.reason,
      changedAt: new Date(),
    })
    .where(
      and(
        eq(currentInitiativeTable.userId, userId),
        eq(currentInitiativeTable.date, dateObj)
      )
    );

  // Fetch the updated record
  const [updated] = await DB.select()
    .from(currentInitiativeTable)
    .where(
      and(
        eq(currentInitiativeTable.userId, userId),
        eq(currentInitiativeTable.date, dateObj)
      )
    );

  return createSuccessResponse({ initiative: updated });
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

  const [initiative] = await DB.select()
    .from(currentInitiativeTable)
    .where(
      and(
        eq(currentInitiativeTable.userId, userId),
        eq(currentInitiativeTable.date, dateObj)
      )
    );

  if (!initiative) {
    return createErrorResponse('No initiative found for this date', 404);
  }

  return createSuccessResponse({ initiative });
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
