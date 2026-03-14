import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { apiKeysTable } from '@/shared/lib/drizzle/schema';
import { and, eq, isNull } from 'drizzle-orm';
import crypto from 'crypto';
import { ApiAuthError } from '@/shared/lib/api/auth-errors';

export { ApiAuthError };

function extractApiKey(headerGetter: (name: string) => string | null): string | null {
  const authHeader = headerGetter('authorization') || headerGetter('Authorization');
  const xApiKey = headerGetter('x-api-key') || headerGetter('X-Api-Key') || headerGetter('X-API-Key');

  if (xApiKey && xApiKey.trim().length > 0) return xApiKey.trim();
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export function getApiKeyFromHeaders(): string | null {
  const hs = headers();
  return extractApiKey((name) => hs.get(name));
}

export function getApiKeyFromRequest(req: NextRequest): string | null {
  return extractApiKey((name) => req.headers.get(name));
}

export function hashApiKey(key: string) {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) {
    throw new Error('API_KEY_SECRET is not set');
  }
  return crypto.createHmac('sha256', secret).update(key).digest('hex');
}

export async function authenticateApiKey(req: NextRequest): Promise<string> {
  const apiKey = getApiKeyFromRequest(req);
  if (!apiKey) {
    throw new ApiAuthError('API key required');
  }
  const hashed = hashApiKey(apiKey);
  const rows = await DB.select()
    .from(apiKeysTable)
    .where(and(eq(apiKeysTable.hashedKey, hashed), isNull(apiKeysTable.revokedAt)));
  if (rows.length === 0) {
    throw new ApiAuthError('Invalid or revoked API key');
  }
  const key = rows[0];
  try {
    await DB.update(apiKeysTable)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeysTable.id, key.id));
  } catch {
    // Non-critical: lastUsedAt tracking failure should not block authentication
  }
  return key.userId as string;
}

