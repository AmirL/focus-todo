import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth } from '@/shared/lib/api/api-route-wrapper';
import { serializeInitiative } from '../serialize';
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
export function GET(req: NextRequest, context: RouteContext) {
  return withApiAuth(async (r, userId) => {
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
  }, 'GET /api/initiative/:date')(req);
}

/**
 * PATCH /api/initiative/:date - Change focus for a specific date
 *
 * Body: { listId: number, reason?: string }
 */
export function PATCH(req: NextRequest, context: RouteContext) {
  return withApiAuth(async (r, userId) => {
    const { date } = await context.params;

    if (!isValidDate(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    const body = await r.json();

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

    if (!updated) {
      return NextResponse.json({ error: 'Initiative not found after update' }, { status: 404 });
    }

    return NextResponse.json({ initiative: serializeInitiative(updated) }, { status: 200 });
  }, 'PATCH /api/initiative/:date')(req);
}
