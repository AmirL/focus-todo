import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { apiKeysTable } from '@/shared/lib/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { validateUserSession } from '../../user-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await validateUserSession();
    const body = await req.json();
    const id = body?.id as number | undefined;
    if (!id) {
      return NextResponse.json({ error: 'Missing key id' }, { status: 400 });
    }

    await DB.update(apiKeysTable)
      .set({ revokedAt: new Date() })
      .where(and(eq(apiKeysTable.id, id), eq(apiKeysTable.userId, session.user.id)));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
