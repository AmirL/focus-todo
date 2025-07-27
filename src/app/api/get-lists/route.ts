import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { eq, sql } from 'drizzle-orm';
import { listsTable } from '@/shared/lib/drizzle/schema';

export async function POST(req: NextRequest) {
  try {
    const session = await validateUserSession();

    let lists = await DB.select()
      .from(listsTable)
      .where(eq(listsTable.userId, session.user.id))
      .orderBy(listsTable.createdAt);

    // If user has no lists, create default ones
    if (lists.length === 0) {
      try {
        const defaultLists = [
          { name: 'Work', userId: session.user.id, isDefault: true },
          { name: 'Personal', userId: session.user.id, isDefault: true }
        ];
        
        await DB.insert(listsTable).values(defaultLists);
        
        // Fetch the lists again (may have been created by another request)
        lists = await DB.select()
          .from(listsTable)
          .where(eq(listsTable.userId, session.user.id))
          .orderBy(listsTable.createdAt);
      } catch (error) {
        // If insert fails due to constraint violation, just fetch existing lists
        lists = await DB.select()
          .from(listsTable)
          .where(eq(listsTable.userId, session.user.id))
          .orderBy(listsTable.createdAt);
      }
    }

    return NextResponse.json({ lists }, { status: 200 });
  } catch (error) {
    console.error('Error in get-lists:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}