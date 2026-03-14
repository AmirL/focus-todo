import { NextRequest, NextResponse } from 'next/server';
import { withAuthAndErrorHandling, createSuccessResponse, type AuthenticatedSession } from '@/shared/lib/api/route-wrapper';
import { DB } from '@/shared/lib/db';
import { and, eq, inArray } from 'drizzle-orm';
import { listsTable } from '@/shared/lib/drizzle/schema';

type ReorderListsRequestBody = {
  listIds: string[];
};

async function reorderListsHandler(req: NextRequest, session: AuthenticatedSession) {
  const { listIds }: ReorderListsRequestBody = await req.json();

  if (!Array.isArray(listIds) || listIds.length === 0) {
    return NextResponse.json(
      { error: 'listIds must be a non-empty array' },
      { status: 400 }
    );
  }

  const userLists = await DB.select({ id: listsTable.id })
    .from(listsTable)
    .where(
      and(
        eq(listsTable.userId, session.user.id),
        inArray(listsTable.id, listIds.map(id => parseInt(id)))
      )
    );

  if (userLists.length !== listIds.length) {
    return NextResponse.json(
      { error: 'Some lists do not belong to the authenticated user' },
      { status: 403 }
    );
  }

  await DB.transaction(async (tx) => {
    for (let i = 0; i < listIds.length; i++) {
      await tx
        .update(listsTable)
        .set({ sortOrder: i })
        .where(
          and(
            eq(listsTable.id, parseInt(listIds[i])),
            eq(listsTable.userId, session.user.id)
          )
        );
    }
  });

  const updatedLists = await DB.select()
    .from(listsTable)
    .where(
      and(
        eq(listsTable.userId, session.user.id),
        inArray(listsTable.id, listIds.map(id => parseInt(id)))
      )
    );

  return createSuccessResponse({
    success: true,
    lists: updatedLists,
    message: `Successfully reordered ${listIds.length} lists`
  });
}

export const POST = withAuthAndErrorHandling(reorderListsHandler, 'reorder-lists');
