import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { handleApiError } from '@/shared/lib/api/auth-errors';

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
      return handleApiError(error, routeName);
    }
  };
}

export function createErrorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
