import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { apiKeysTable } from '@/shared/lib/drizzle/schema';
import { validateUserSession } from '../../user-auth';
import { hashApiKey } from '@/app/api/api-auth';
import crypto from 'crypto';

function generateApiKey(): { key: string; prefix: string; lastFour: string } {
  // Generate url-safe random key
  const raw = crypto.randomBytes(32).toString('base64url');
  const key = `dak_${raw}`; // doable api key
  const prefix = key.slice(0, 8);
  const lastFour = key.slice(-4);
  return { key, prefix, lastFour };
}


export async function POST(req: NextRequest) {
  try {
    const session = await validateUserSession();
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

    // Optionally read created row (for createdAt)
    // const [row] = await DB.select().from(apiKeysTable).where(eq(apiKeysTable.id, id));

    return NextResponse.json(
      {
        id,
        name: name ?? null,
        key, // returned only once
        prefix,
        lastFour,
        createdAt: now,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
