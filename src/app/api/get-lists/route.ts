import { NextRequest } from 'next/server';
import { withAuthAndErrorHandling, createSuccessResponse } from '@/shared/lib/api/route-wrapper';
import { getUserLists, createDefaultLists } from '@/shared/lib/db/list-queries';

async function getListsHandler(req: NextRequest, session: { user: { id: string } }) {
  let body: { includeArchived?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // Empty body is fine, defaults apply
  }

  const includeArchived = body.includeArchived === true;
  let lists = await getUserLists(session.user.id, includeArchived);

  // If user has no lists, create default ones
  if (lists.length === 0) {
    try {
      await createDefaultLists(session.user.id);

      // Fetch the lists again (may have been created by another request)
      lists = await getUserLists(session.user.id, includeArchived);
    } catch (error) {
      // If insert fails due to constraint violation, just fetch existing lists
      lists = await getUserLists(session.user.id, includeArchived);
    }
  }

  return createSuccessResponse({ lists }, 200);
}

export const POST = withAuthAndErrorHandling(getListsHandler, 'get-lists');
