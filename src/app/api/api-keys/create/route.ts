import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { apiKeysTable } from '@/shared/lib/drizzle/schema';
import { hashApiKey } from '@/app/api/api-auth';
import crypto from 'crypto';
import { withAuthAndErrorHandling, createSuccessResponse } from '@/shared/lib/api/route-wrapper';

function generateApiKey(): { key: string; prefix: string; lastFour: string } {
  const raw = crypto.randomBytes(32).toString('base64url');
  const key = `dak_${raw}`;
  const prefix = key.slice(0, 8);
  const lastFour = key.slice(-4);
  return { key, prefix, lastFour };
}

async function createApiKeyHandler(req: NextRequest, session: { user: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const name: string | undefined = body?.name;

  const { key, prefix, lastFour } = generateApiKey();
  const hashedKey = hashApiKey(key);

  const now = new Date();
  const [{ id }] = await DB.insert(apiKeysTable)
    .values({
      userId: session.user.id,
      name,
      hashedKey,
      prefix,
      lastFour,
      createdAt: now,
    })
    .$returningId();

  return createSuccessResponse({
    id,
    name: name ?? null,
    key,
    prefix,
    lastFour,
    createdAt: now,
  });
}

export const POST = withAuthAndErrorHandling(createApiKeyHandler, 'create-api-key');
