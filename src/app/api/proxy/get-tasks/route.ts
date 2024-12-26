import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { handleBaseRowRequest } from '../baserow';

export async function POST(req: NextRequest) {
  await validateUserSession();

  const result = await handleBaseRowRequest('GET', {}, '');
  return NextResponse.json(result.response, { status: result.status });
}
