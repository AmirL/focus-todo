import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { eq, sql } from 'drizzle-orm';
import { listsTable } from '@/shared/lib/drizzle/schema';
import { withApiAuth } from '@/shared/lib/api/api-route-wrapper';
import { serializeList } from './serialize';
import { getUserLists, findUserListByName } from '@/shared/lib/db/list-queries';
import { validateListColor } from '@/shared/lib/colors';

/**
 * GET /api/lists - List all lists for the authenticated user
 *
 * Query params:
 *   - includeArchived: Include archived lists (default: false)
 */
async function getHandler(req: NextRequest, userId: string) {
  const { searchParams } = new URL(req.url);
  const includeArchived = searchParams.get('includeArchived') === 'true';

  const lists = await getUserLists(userId, includeArchived);

  return NextResponse.json({ lists: lists.map(serializeList) }, { status: 200 });
}

/**
 * POST /api/lists - Create a new list
 *
 * Body: { name: string, description?: string, participatesInInitiative?: boolean }
 */
async function postHandler(req: NextRequest, userId: string) {
  const body = await req.json();

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    return NextResponse.json({ error: 'List name is required' }, { status: 400 });
  }

  if (body.name.trim().length > 255) {
    return NextResponse.json({ error: 'List name must be 255 characters or less' }, { status: 400 });
  }

  const colorValidation = validateListColor(body.color);
  if (!colorValidation.isValid) {
    return NextResponse.json({ error: colorValidation.error }, { status: 400 });
  }

  // Check for duplicate name
  const existing = await findUserListByName(userId, body.name.trim());
  if (existing) {
    return NextResponse.json({ error: 'A list with this name already exists' }, { status: 409 });
  }

  // Get next sort order
  const [maxSortOrderResult] = await DB.select({
    maxSortOrder: sql<number>`COALESCE(MAX(${listsTable.sortOrder}), -1)`,
  })
    .from(listsTable)
    .where(eq(listsTable.userId, userId));

  const nextSortOrder = (maxSortOrderResult?.maxSortOrder ?? -1) + 1;

  const [{ id }] = await DB.insert(listsTable)
    .values({
      name: body.name.trim(),
      description: body.description ?? null,
      color: body.color ?? null,
      userId,
      isDefault: false,
      participatesInInitiative: body.participatesInInitiative ?? true,
      sortOrder: nextSortOrder,
    })
    .$returningId();

  const [created] = await DB.select()
    .from(listsTable)
    .where(eq(listsTable.id, id));

  return NextResponse.json({ list: serializeList(created) }, { status: 201 });
}

export const GET = withApiAuth(getHandler, 'GET /api/lists');
export const POST = withApiAuth(postHandler, 'POST /api/lists');
