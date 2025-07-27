import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { and, eq, sql } from 'drizzle-orm';
import { listsTable, tasksTable, goalsTable } from '@/shared/lib/drizzle/schema';

export async function POST(req: NextRequest) {
  try {
    const session = await validateUserSession();
    const { id, reassignToListId } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'List ID is required' },
        { status: 400 }
      );
    }

    // Check if the list exists and belongs to the user
    const [existingList] = await DB.select()
      .from(listsTable)
      .where(and(
        eq(listsTable.id, id),
        eq(listsTable.userId, session.user.id)
      ));

    if (!existingList) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    // Check if there are tasks or goals using this list
    const [tasksCountResult] = await DB.select({ count: sql<number>`count(*)` })
      .from(tasksTable)
      .where(and(
        eq(tasksTable.userId, session.user.id),
        eq(tasksTable.list, existingList.name)
      ));

    const [goalsCountResult] = await DB.select({ count: sql<number>`count(*)` })
      .from(goalsTable)
      .where(and(
        eq(goalsTable.userId, session.user.id),
        eq(goalsTable.list, existingList.name)
      ));

    const tasksCount = tasksCountResult?.count || 0;
    const goalsCount = goalsCountResult?.count || 0;

    if ((tasksCount > 0 || goalsCount > 0) && !reassignToListId) {
      return NextResponse.json(
        { error: 'Cannot delete list with existing tasks or goals. Please specify a list to reassign them to.' },
        { status: 400 }
      );
    }

    // If reassignment is needed, verify the target list exists
    if (reassignToListId) {
      const [targetList] = await DB.select()
        .from(listsTable)
        .where(and(
          eq(listsTable.id, reassignToListId),
          eq(listsTable.userId, session.user.id)
        ));

      if (!targetList) {
        return NextResponse.json(
          { error: 'Target list for reassignment not found' },
          { status: 404 }
        );
      }

      // Reassign tasks and goals to the new list
      await DB.update(tasksTable)
        .set({ list: targetList.name })
        .where(and(
          eq(tasksTable.userId, session.user.id),
          eq(tasksTable.list, existingList.name)
        ));

      await DB.update(goalsTable)
        .set({ list: targetList.name })
        .where(and(
          eq(goalsTable.userId, session.user.id),
          eq(goalsTable.list, existingList.name)
        ));
    }

    // Delete the list
    await DB.delete(listsTable)
      .where(and(
        eq(listsTable.id, id),
        eq(listsTable.userId, session.user.id)
      ));

    return NextResponse.json(
      { message: 'List deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in delete-list:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}