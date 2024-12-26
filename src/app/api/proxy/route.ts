// app/api/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { handleBaseRowRequest } from './baserow';
import { validateUserSession } from './user-auth';

export async function POST(req: NextRequest) {
  await validateUserSession();

  const { endpoint, method = 'GET', body } = await req.json();

  const result = await handleBaseRowRequest(method, body, endpoint);
  return NextResponse.json(result.response, { status: result.status });
}
