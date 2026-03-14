import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/app/api/api-auth';
import { handleApiError } from '@/shared/lib/api/auth-errors';

type ApiKeyRouteHandler = (
  req: NextRequest,
  userId: string
) => Promise<NextResponse>;

/** Wrapper for API-key-authenticated routes. Authenticates the request and handles errors. */
export function withApiAuth(
  handler: ApiKeyRouteHandler,
  routeName: string
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const userId = await authenticateApiKey(req);
      return await handler(req, userId);
    } catch (error) {
      return handleApiError(error, routeName);
    }
  };
}
