import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { eq, sql } from 'drizzle-orm';
import { listsTable } from '@/shared/lib/drizzle/schema';
import { withAuthAndErrorHandling, createErrorResponse, createSuccessResponse } from '@/shared/lib/api/route-wrapper';
import { validateCreateListRequest } from '@/shared/lib/validation/list-validation';
import { findUserListByName } from '@/shared/lib/db/list-queries';

async function createListHandler(req: NextRequest, session: { user: { id: string } }) {
  const requestBody = await req.json();
  const validation = validateCreateListRequest(requestBody);

  if (!validation.isValid) {
    return createErrorResponse(validation.error!, 400);
  }

  const { name, participatesInInitiative } = validation;

  // Check if list with same name already exists for this user
  const existingList = await findUserListByName(session.user.id, name!);

  if (existingList.length > 0) {
    return createErrorResponse('A list with this name already exists', 409);
  }

  // Get the max sortOrder for this user's lists
  const [maxSortOrderResult] = await DB.select({
    maxSortOrder: sql<number>`COALESCE(MAX(${listsTable.sortOrder}), -1)`
  })
    .from(listsTable)
    .where(eq(listsTable.userId, session.user.id));

  const nextSortOrder = (maxSortOrderResult?.maxSortOrder ?? -1) + 1;

  const [{ id }] = await DB.insert(listsTable).values({
    name: name!,
    userId: session.user.id,
    isDefault: false,
    participatesInInitiative: participatesInInitiative ?? true,
    sortOrder: nextSortOrder
  }).$returningId();

  const [createdList] = await DB.select()
    .from(listsTable)
    .where(eq(listsTable.id, id));

  return createSuccessResponse(createdList, 201);
}

export const POST = withAuthAndErrorHandling(createListHandler, 'create-list');