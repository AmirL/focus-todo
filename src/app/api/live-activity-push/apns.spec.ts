import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { generateKeyPairSync } from 'crypto';
import { sendLiveActivityUpdate } from './apns';

// Generate a real EC P-256 key pair for test signing
let TEST_KEY_BASE64: string;

beforeAll(() => {
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
  TEST_KEY_BASE64 = Buffer.from(pem).toString('base64');
});

describe('sendLiveActivityUpdate', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    vi.stubEnv('APNS_SANDBOX', 'true');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  const defaultOptions = () => ({
    pushToken: 'abc123',
    isRunning: true,
    keyId: 'TESTKEY123',
    teamId: 'TEAM123456',
    authKeyBase64: TEST_KEY_BASE64,
  });

  it('sends a push to the sandbox APNs server by default', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 200 }));

    const result = await sendLiveActivityUpdate(defaultOptions());

    expect(result.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledOnce();

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.sandbox.push.apple.com/3/device/abc123');
    expect((options as RequestInit).method).toBe('POST');

    const headers = (options as RequestInit).headers as Record<string, string>;
    expect(headers['apns-push-type']).toBe('liveactivity');
    expect(headers['apns-topic']).toBe('com.focustodo.app.push-type.liveactivity');
    expect(headers.authorization).toMatch(/^bearer /);

    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.aps.event).toBe('update');
    expect(body.aps['content-state'].isRunning).toBe(true);
    expect(body.aps.timestamp).toBeTypeOf('number');
  });

  it('sends event "end" when isRunning is false', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 200 }));

    await sendLiveActivityUpdate({ ...defaultOptions(), isRunning: false });

    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(body.aps.event).toBe('end');
    expect(body.aps['content-state'].isRunning).toBe(false);
  });

  it('uses production server when APNS_SANDBOX is false', async () => {
    vi.stubEnv('APNS_SANDBOX', 'false');
    fetchSpy.mockResolvedValue(new Response(null, { status: 200 }));

    await sendLiveActivityUpdate(defaultOptions());

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.push.apple.com/3/device/abc123');
  });

  it('returns error when APNs responds with non-200', async () => {
    fetchSpy.mockResolvedValue(new Response('BadDeviceToken', { status: 400 }));

    const result = await sendLiveActivityUpdate(defaultOptions());

    expect(result.ok).toBe(false);
    expect(result.error).toContain('HTTP 400');
    expect(result.error).toContain('BadDeviceToken');
  });

  it('returns error when fetch throws', async () => {
    fetchSpy.mockRejectedValue(new Error('Network error'));

    const result = await sendLiveActivityUpdate(defaultOptions());

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Network error');
  });

  it('generates a valid JWT with correct structure', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 200 }));

    await sendLiveActivityUpdate(defaultOptions());

    const headers = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    const jwt = headers.authorization.replace('bearer ', '');
    const parts = jwt.split('.');
    expect(parts).toHaveLength(3);

    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    expect(header.alg).toBe('ES256');
    expect(header.kid).toBe('TESTKEY123');

    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    expect(claims.iss).toBe('TEAM123456');
    expect(claims.iat).toBeTypeOf('number');
  });
});
