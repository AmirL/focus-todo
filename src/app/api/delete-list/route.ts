import { NextRequest } from 'next/server';
import { withAuthAndErrorHandling, createErrorResponse, createSuccessResponse } from '@/shared/lib/api/route-wrapper';
import { 
  findUserListById, 
  countListUsage, 
  reassignItemsToNewList, 
  deleteUserList 
} from '@/shared/lib/db/list-queries';

async function deleteListHandler(req: NextRequest, session: { user: { id: string } }) {
  const { id, reassignToListId } = await req.json();

  if (!id) {
    return createErrorResponse('List ID is required', 400);
  }

  // Check if the list exists and belongs to the user
  const existingList = await findUserListById(session.user.id, id);

  if (!existingList) {
    return createErrorResponse('List not found', 404);
  }

  // Check if there are tasks or goals using this list
  const { tasksCount, goalsCount } = await countListUsage(session.user.id, existingList.name);

  if ((tasksCount > 0 || goalsCount > 0) && !reassignToListId) {
    return createErrorResponse(
      'Cannot delete list with existing tasks or goals. Please specify a list to reassign them to.',
      400
    );
  }

  // If reassignment is needed, verify the target list exists
  if (reassignToListId) {
    const targetList = await findUserListById(session.user.id, reassignToListId);

    if (!targetList) {
      return createErrorResponse('Target list for reassignment not found', 404);
    }

    // Reassign tasks and goals to the new list
    await reassignItemsToNewList(session.user.id, existingList.name, targetList.name);
  }

  // Delete the list
  await deleteUserList(session.user.id, id);

  return createSuccessResponse({ message: 'List deleted successfully' }, 200);
}

export const POST = withAuthAndErrorHandling(deleteListHandler, 'delete-list');