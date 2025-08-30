import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { apiKeysTable } from '@/shared/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { validateUserSession } from '../../user-auth';

export async function POST(_req: NextRequest) {
  try {
    const session = await validateUserSession();
    const rows = await DB.select()
      .from(apiKeysTable)
      .where(eq(apiKeysTable.userId, session.user.id));

    const keys = rows.map((r) => ({
      id: r.id,
      name: r.name ?? null,
      prefix: r.prefix,
      lastFour: r.lastFour,
      createdAt: r.createdAt,
      lastUsedAt: r.lastUsedAt ?? null,
      revokedAt: r.revokedAt ?? null,
    }));

    return NextResponse.json({ keys }, { status: 200 });
  } catch (error) {
    console.error('Error listing API keys:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

