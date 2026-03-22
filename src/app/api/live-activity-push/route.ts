import { NextRequest } from 'next/server';
import { withAuthAndErrorHandling, createErrorResponse, createSuccessResponse } from '@/shared/lib/api/route-wrapper';
import { sendLiveActivityUpdate } from './apns';

/**
 * POST /api/live-activity-push
 *
 * Sends an APNs push to update a Live Activity.
 * Body: { pushToken: string, isRunning: boolean }
 *
 * Requires APNs credentials configured via environment variables:
 *   APNS_KEY_ID, APNS_TEAM_ID, APNS_AUTH_KEY_P8 (base64-encoded .p8 key)
 */
async function handler(req: NextRequest) {
  const { pushToken, isRunning } = await req.json();

  if (!pushToken || typeof isRunning !== 'boolean') {
    return createErrorResponse('pushToken (string) and isRunning (boolean) are required', 400);
  }

  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const authKeyBase64 = process.env.APNS_AUTH_KEY_P8;

  if (!keyId || !teamId || !authKeyBase64) {
    return createErrorResponse(
      'APNs credentials not configured. Set APNS_KEY_ID, APNS_TEAM_ID, and APNS_AUTH_KEY_P8.',
      500,
    );
  }

  const result = await sendLiveActivityUpdate({
    pushToken,
    isRunning,
    keyId,
    teamId,
    authKeyBase64,
  });

  if (!result.ok) {
    return createErrorResponse(`APNs push failed: ${result.error}`, 502);
  }

  return createSuccessResponse({ sent: true });
}

export const POST = withAuthAndErrorHandling(handler, 'live-activity-push');
