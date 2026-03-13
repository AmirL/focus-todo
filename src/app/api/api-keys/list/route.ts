import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { apiKeysTable } from '@/shared/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { withAuthAndErrorHandling, createSuccessResponse } from '@/shared/lib/api/route-wrapper';

async function listApiKeysHandler(_req: NextRequest, session: { user: { id: string } }) {
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

  return createSuccessResponse({ keys });
}

export const POST = withAuthAndErrorHandling(listApiKeysHandler, 'list-api-keys');
