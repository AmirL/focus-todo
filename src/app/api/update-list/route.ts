import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { listsTable } from '@/shared/lib/drizzle/schema';
import { withAuthAndErrorHandling, createErrorResponse, createSuccessResponse } from '@/shared/lib/api/route-wrapper';
import { validateUpdateListRequest } from '@/shared/lib/validation/list-validation';
import { findUserListById, findUserListByName, userListFilter } from '@/shared/lib/db/list-queries';

async function updateListHandler(req: NextRequest, session: { user: { id: string } }) {
  const requestBody = await req.json();
  const validation = validateUpdateListRequest(requestBody);

  if (!validation.isValid) {
    return createErrorResponse(validation.error!, 400);
  }

  const { id, name } = validation;

  // Check if the list exists and belongs to the user
  const existingList = await findUserListById(session.user.id, id!);

  if (!existingList) {
    return createErrorResponse('List not found', 404);
  }

  // Check if another list with the same name already exists for this user
  const duplicateList = await findUserListByName(session.user.id, name!);

  if (duplicateList.length > 0 && duplicateList[0].id !== id) {
    return createErrorResponse('A list with this name already exists', 409);
  }

  await DB.update(listsTable)
    .set({ 
      name: name!,
      updatedAt: new Date()
    })
    .where(userListFilter(session.user.id, id!));

  const [updatedList] = await DB.select()
    .from(listsTable)
    .where(eq(listsTable.id, id!));

  return createSuccessResponse(updatedList, 200);
}

export const POST = withAuthAndErrorHandling(updateListHandler, 'update-list');