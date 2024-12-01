// app/api/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

const BASEROW_TOKEN = process.env.BASEROW_TOKEN;
const TABLE_ID = 379718;
const API_URL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/`;
const APP_NAMESPACE = 'https://doable-tasks.vercel.app';

export async function POST(req: NextRequest) {
  try {
    await validateUserSession();

    const { endpoint, method = 'GET', body } = await req.json();

    const { ok, data, status } = await sendApiRequest(method, body, endpoint);

    if (!ok) {
      return NextResponse.json({ error: data }, { status });
    }

    const parsed = method !== 'DELETE' ? JSON.parse(data) : { ok: true };

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    if (!(error instanceof Error)) return;

    console.error(`API request failed: ${error.message ?? ''}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function sendApiRequest(method: string, body: object | null, endpoint: string) {
  const options = {
    method,
    headers: {
      Authorization: `Token ${BASEROW_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.text();
  return { ok: response.ok, data, status: response.status };
}

async function validateUserSession() {
  const session = await getSession();
  invariant(session, 'No session found');
  invariant(session.user, 'No user found in session');

  const roles = session.user[`${APP_NAMESPACE}/roles`] || [];
  invariant(roles.includes('admin'), 'User is not an admin');
}

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
