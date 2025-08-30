import { headers } from 'next/headers';
import { DB } from '@/shared/lib/db';
import { apiKeysTable } from '@/shared/lib/drizzle/schema';
import { and, eq, isNull } from 'drizzle-orm';
import crypto from 'crypto';

export function getApiKeyFromHeaders(): string | null {
  const hs = headers();
  const authHeader = hs.get('authorization') || hs.get('Authorization');
  const xApiKey = hs.get('x-api-key') || hs.get('X-Api-Key') || hs.get('X-API-Key');

  if (xApiKey && xApiKey.trim().length > 0) return xApiKey.trim();
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export function hashApiKey(key: string) {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) {
    throw new Error('API_KEY_SECRET is not set');
  }
  return crypto.createHmac('sha256', secret).update(key).digest('hex');
}

export async function getUserIdFromApiKey(): Promise<string> {
  const apiKey = getApiKeyFromHeaders();
  if (!apiKey) {
    throw new Error('API key required');
  }
  const hashed = hashApiKey(apiKey);
  const rows = await DB.select()
    .from(apiKeysTable)
    .where(and(eq(apiKeysTable.hashedKey, hashed), isNull(apiKeysTable.revokedAt)));
  if (rows.length === 0) {
    throw new Error('Invalid or revoked API key');
  }
  const key = rows[0];
  try {
    await DB.update(apiKeysTable)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeysTable.id, key.id));
  } catch {}
  return key.userId as string;
}

