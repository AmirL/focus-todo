import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockUpdate = vi.fn();
const mockSet = vi.fn();
const mockWhere = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    update: () => mockUpdate(),
  },
}));

mockUpdate.mockReturnValue({ set: mockSet });
mockSet.mockReturnValue({ where: mockWhere });

vi.mock('@/app/api/user-auth', () => ({
  validateUserSession: vi.fn(),
  AuthError: class AuthError extends Error {},
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { POST } from './route';
import { validateUserSession } from '@/app/api/user-auth';

const mockedValidate = vi.mocked(validateUserSession);

const mockSession = {
  user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
  session: { id: 'session-1' },
};

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/api-keys/revoke', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/api-keys/revoke', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    mockedValidate.mockResolvedValue(mockSession as never);
  });

  it('revokes a key successfully', async () => {
    mockWhere.mockResolvedValue(undefined);
    const res = await POST(makeRequest({ id: 42 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('returns 400 when id is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Missing');
  });

  it('returns 500 when session validation fails', async () => {
    mockedValidate.mockRejectedValue(new Error('No session'));
    const res = await POST(makeRequest({ id: 1 }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('No session');
  });

  it('returns 500 when DB update fails', async () => {
    mockWhere.mockRejectedValue(new Error('DB error'));
    const res = await POST(makeRequest({ id: 1 }));
    expect(res.status).toBe(500);
  });
});
