import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { handleBaseRowRequest } from '../baserow';

export async function POST(req: NextRequest) {
  await validateUserSession();

  const { task } = await req.json();

  const result = await handleBaseRowRequest('POST', task, ``);
  return NextResponse.json(result.response, { status: result.status });
}
