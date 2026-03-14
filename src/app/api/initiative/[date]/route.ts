import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/app/api/api-auth';
import { serializeInitiative, handleApiError } from '../serialize';
import {
  toDate,
  isValidDate,
  findInitiativeByDate,
  updateInitiativeChoice,
  verifyListOwnership,
} from '@/shared/lib/api/initiative-helpers';

type RouteContext = { params: Promise<{ date: string }> };

/**
 * GET /api/initiative/:date - Get initiative for a specific date
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const userId = await authenticateApiKey(req);
    const { date } = await context.params;

    if (!isValidDate(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    const dateObj = toDate(date);
    const initiative = await findInitiativeByDate(userId, dateObj);

    if (!initiative) {
      return NextResponse.json({ error: 'No initiative found for this date' }, { status: 404 });
    }

    return NextResponse.json({ initiative: serializeInitiative(initiative) }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'GET /api/initiative/:date');
  }
}

/**
 * PATCH /api/initiative/:date - Change focus for a specific date
 *
 * Body: { listId: number, reason?: string }
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const userId = await authenticateApiKey(req);
    const { date } = await context.params;

    if (!isValidDate(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    const body = await req.json();

    if (!body.listId) {
      return NextResponse.json({ error: 'listId is required' }, { status: 400 });
    }

    // Verify list belongs to user
    const list = await verifyListOwnership(body.listId, userId);

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    const dateObj = toDate(date);

    // Find existing initiative
    const existing = await findInitiativeByDate(userId, dateObj);

    if (!existing) {
      return NextResponse.json(
        { error: 'No initiative found for this date. Use POST to create one.' },
        { status: 404 }
      );
    }

    // Update
    const updated = await updateInitiativeChoice(
      userId,
      dateObj,
      body.listId,
      body.reason,
      existing.reason
    );

    return NextResponse.json({ initiative: serializeInitiative(updated!) }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'PATCH /api/initiative/:date');
  }
}
