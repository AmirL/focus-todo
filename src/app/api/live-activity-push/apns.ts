import { createPrivateKey, sign } from 'crypto';

interface ApnsPushOptions {
  pushToken: string;
  isRunning: boolean;
  keyId: string;
  teamId: string;
  /** Base64-encoded .p8 private key file contents */
  authKeyBase64: string;
}

interface ApnsResult {
  ok: boolean;
  error?: string;
}

/**
 * Sends an APNs push notification to update a Live Activity.
 *
 * Uses the APNs HTTP/2 API with JWT (token-based) authentication.
 * The push payload uses the content-state format that ActivityKit expects.
 */
export async function sendLiveActivityUpdate(options: ApnsPushOptions): Promise<ApnsResult> {
  const { pushToken, isRunning, keyId, teamId, authKeyBase64 } = options;

  try {
    const jwt = createApnsJwt(keyId, teamId, authKeyBase64);

    // Use sandbox APNs for development; switch to api.push.apple.com for production
    const useSandbox = process.env.APNS_SANDBOX !== 'false';
    const host = useSandbox ? 'api.sandbox.push.apple.com' : 'api.push.apple.com';
    const url = `https://${host}/3/device/${pushToken}`;

    const payload = {
      aps: {
        timestamp: Math.floor(Date.now() / 1000),
        event: isRunning ? 'update' : 'end',
        'content-state': {
          isRunning,
        },
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: `bearer ${jwt}`,
        'apns-topic': 'com.focustodo.app.push-type.liveactivity',
        'apns-push-type': 'liveactivity',
        'apns-priority': '10',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: `HTTP ${response.status}: ${body}` };
    }

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

/**
 * Creates a short-lived JWT for APNs token-based authentication.
 * Uses ES256 (ECDSA with P-256 and SHA-256) as required by Apple.
 */
function createApnsJwt(keyId: string, teamId: string, authKeyBase64: string): string {
  const keyPem = Buffer.from(authKeyBase64, 'base64').toString('utf-8');

  const header = base64url(JSON.stringify({ alg: 'ES256', kid: keyId }));
  const now = Math.floor(Date.now() / 1000);
  const claims = base64url(JSON.stringify({ iss: teamId, iat: now }));

  const signingInput = `${header}.${claims}`;
  const privateKey = createPrivateKey(keyPem);
  const signature = sign('SHA256', Buffer.from(signingInput), {
    key: privateKey,
    dsaEncoding: 'ieee-p1363',
  });

  return `${signingInput}.${base64url(signature)}`;
}

function base64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64url');
}
