import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { listsTable } from '@/shared/lib/drizzle/schema';

export async function POST(req: NextRequest) {
  try {
    const session = await validateUserSession();
    const { id, name } = await req.json();

    if (!id || !name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'List ID and name are required' },
        { status: 400 }
      );
    }

    if (name.trim().length > 255) {
      return NextResponse.json(
        { error: 'List name must be 255 characters or less' },
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

    // Check if another list with the same name already exists for this user
    const duplicateList = await DB.select()
      .from(listsTable)
      .where(and(
        eq(listsTable.userId, session.user.id),
        eq(listsTable.name, name.trim())
      ));

    if (duplicateList.length > 0 && duplicateList[0].id !== id) {
      return NextResponse.json(
        { error: 'A list with this name already exists' },
        { status: 409 }
      );
    }

    await DB.update(listsTable)
      .set({ 
        name: name.trim(),
        updatedAt: new Date()
      })
      .where(and(
        eq(listsTable.id, id),
        eq(listsTable.userId, session.user.id)
      ));

    const [updatedList] = await DB.select()
      .from(listsTable)
      .where(eq(listsTable.id, id));

    return NextResponse.json(updatedList, { status: 200 });
  } catch (error) {
    console.error('Error in update-list:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}