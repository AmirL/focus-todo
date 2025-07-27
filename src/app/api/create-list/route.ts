import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { listsTable } from '@/shared/lib/drizzle/schema';

export async function POST(req: NextRequest) {
  try {
    const session = await validateUserSession();
    const { name } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'List name is required' },
        { status: 400 }
      );
    }

    if (name.trim().length > 255) {
      return NextResponse.json(
        { error: 'List name must be 255 characters or less' },
        { status: 400 }
      );
    }

    // Check if list with same name already exists for this user
    const existingList = await DB.select()
      .from(listsTable)
      .where(and(
        eq(listsTable.userId, session.user.id),
        eq(listsTable.name, name.trim())
      ));

    if (existingList.length > 0) {
      return NextResponse.json(
        { error: 'A list with this name already exists' },
        { status: 409 }
      );
    }

    const [{ id }] = await DB.insert(listsTable).values({
      name: name.trim(),
      userId: session.user.id,
      isDefault: false
    }).$returningId();

    const [createdList] = await DB.select()
      .from(listsTable)
      .where(eq(listsTable.id, id));

    return NextResponse.json(createdList, { status: 201 });
  } catch (error) {
    console.error('Error in create-list:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}