// app/api/proxy/route.ts
import { ok } from 'assert';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

const BASEROW_TOKEN = process.env.BASEROW_TOKEN;
const TABLE_ID = 379718;
const API_URL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/`;

const APP_NAMESPACE = 'https://doable-tasks.vercel.app';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    invariant(session, 'No session found');
    invariant(session.user, 'No user found in session');

    const roles = session.user[`${APP_NAMESPACE}/roles`] || [];
    invariant(roles.includes('admin'), 'User is not an admin');

    const { endpoint, method = 'GET', body } = await req.json();

    const options = {
      method,
      headers: {
        Authorization: `Token ${BASEROW_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorMessage = await response.text();
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }
    if (method === 'DELETE') {
      return NextResponse.json(
        {
          ok,
        },
        { status: 200 }
      );
    }
    const data = await response.json();
    // console.log(`API request successful: ${JSON.stringify(data)}`);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`API request failed: ${error.message ?? ''}`);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}

function invariant(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
