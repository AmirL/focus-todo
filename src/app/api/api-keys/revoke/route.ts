import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { apiKeysTable } from '@/shared/lib/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { withAuthAndErrorHandling, createErrorResponse, createSuccessResponse } from '@/shared/lib/api/route-wrapper';

async function revokeApiKeyHandler(req: NextRequest, session: { user: { id: string } }) {
  const body = await req.json();
  const id = body?.id;
  if (!id || typeof id !== 'number' || !Number.isFinite(id)) {
    return createErrorResponse('Missing or invalid key id', 400);
  }

  await DB.update(apiKeysTable)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeysTable.id, id), eq(apiKeysTable.userId, session.user.id)));

  return createSuccessResponse({ success: true });
}

export const POST = withAuthAndErrorHandling(revokeApiKeyHandler, 'revoke-api-key');
