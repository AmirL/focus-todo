import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '@/app/api/user-auth';

export interface AuthenticatedSession {
  user: {
    id: string;
  };
}

type RouteHandler<T = unknown> = (
  req: NextRequest,
  session: AuthenticatedSession
) => Promise<NextResponse<T | { error: string }>>;

export function withAuthAndErrorHandling<T = unknown>(
  handler: RouteHandler<T>,
  routeName: string
) {
  return async (req: NextRequest): Promise<NextResponse<T | { error: string }>> => {
    try {
      const session = await validateUserSession();
      return await handler(req, session);
    } catch (error) {
      console.error(`Error in ${routeName}:`, error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error occurred' },
        { status: 500 }
      );
    }
  };
}

export function createErrorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}