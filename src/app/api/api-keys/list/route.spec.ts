import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { AuthError } from '@/shared/lib/api/auth-errors';

const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: () => mockSelect(),
  },
}));

mockSelect.mockReturnValue({ from: mockFrom });
mockFrom.mockReturnValue({ where: mockWhere });

vi.mock('@/shared/lib/auth/user-auth', () => ({
  validateUserSession: vi.fn(),
  AuthError,
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { POST } from './route';
import { validateUserSession } from '@/shared/lib/auth/user-auth';

const mockedValidate = vi.mocked(validateUserSession);

const mockSession = {
  user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
  session: { id: 'session-1' },
};

function makeRequest() {
  return new NextRequest('http://localhost:3000/api/api-keys/list', {
    method: 'POST',
  });
}

describe('POST /api/api-keys/list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockedValidate.mockResolvedValue(mockSession as never);
  });

  it('returns list of keys for current user', async () => {
    const dbRows = [
      { id: 1, name: 'Key 1', prefix: 'dak_abcd', lastFour: 'wxyz', createdAt: new Date(), lastUsedAt: null, revokedAt: null },
      { id: 2, name: null, prefix: 'dak_efgh', lastFour: '1234', createdAt: new Date(), lastUsedAt: new Date(), revokedAt: new Date() },
    ];
    mockWhere.mockResolvedValue(dbRows);

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.keys).toHaveLength(2);
    expect(body.keys[0].id).toBe(1);
    expect(body.keys[0].name).toBe('Key 1');
    expect(body.keys[1].name).toBeNull();
    expect(body.keys[1].revokedAt).toBeDefined();
  });

  it('returns empty array when user has no keys', async () => {
    mockWhere.mockResolvedValue([]);
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.keys).toEqual([]);
  });

  it('returns 500 when session validation fails', async () => {
    mockedValidate.mockRejectedValue(new Error('No session'));
    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('No session');
  });

  it('returns 500 when DB query fails', async () => {
    mockWhere.mockRejectedValue(new Error('DB error'));
    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
  });
});
