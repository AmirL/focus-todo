import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { listsTable } from '@/shared/lib/drizzle/schema';
import { withAuthAndErrorHandling, createErrorResponse, createSuccessResponse } from '@/shared/lib/api/route-wrapper';
import { validateUpdateListRequest, validateArchiveListRequest } from '@/shared/lib/validation/list-validation';
import { findUserListById, findUserListByName, setListArchivedStatus, userListFilter } from '@/shared/lib/db/list-queries';

async function updateListHandler(req: NextRequest, session: { user: { id: string } }) {
  const requestBody = await req.json();

  // Handle archive toggle request
  if ('archived' in requestBody) {
    const archiveValidation = validateArchiveListRequest(requestBody);

    if (!archiveValidation.isValid) {
      return createErrorResponse(archiveValidation.error!, 400);
    }

    const existingList = await findUserListById(session.user.id, archiveValidation.id!);
    if (!existingList) {
      return createErrorResponse('List not found', 404);
    }

    await setListArchivedStatus(session.user.id, archiveValidation.id!, archiveValidation.archived!);

    const [updatedList] = await DB.select()
      .from(listsTable)
      .where(eq(listsTable.id, archiveValidation.id!));

    return createSuccessResponse(updatedList, 200);
  }

  // Handle regular update request (name, participatesInInitiative)
  const validation = validateUpdateListRequest(requestBody);

  if (!validation.isValid) {
    return createErrorResponse(validation.error!, 400);
  }

  const { id, name, description, participatesInInitiative, color } = validation;

  const existingList = await findUserListById(session.user.id, id!);

  if (!existingList) {
    return createErrorResponse('List not found', 404);
  }

  const duplicateList = await findUserListByName(session.user.id, name!);

  if (duplicateList && duplicateList.id !== id) {
    return createErrorResponse('A list with this name already exists', 409);
  }

  await DB.update(listsTable)
    .set({
      name: name!,
      ...(description !== undefined && { description }),
      ...(color !== undefined && { color }),
      participatesInInitiative,
      updatedAt: new Date()
    })
    .where(userListFilter(session.user.id, id!));

  const [updatedList] = await DB.select()
    .from(listsTable)
    .where(eq(listsTable.id, id!));

  return createSuccessResponse(updatedList, 200);
}

export const POST = withAuthAndErrorHandling(updateListHandler, 'update-list');
