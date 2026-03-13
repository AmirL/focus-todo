import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { isAuthError } from '@/shared/lib/api/auth-errors';

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
      const msg = error instanceof Error ? error.message : 'Unknown error occurred';
      const status = isAuthError(error) ? 401 : 500;
      if (!isAuthError(error)) {
        console.error(`Error in ${routeName}:`, error);
      }
      return NextResponse.json({ error: msg }, { status });
    }
  };
}

export function createErrorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
