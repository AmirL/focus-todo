import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockInsert = vi.fn();
const mockValues = vi.fn();
const mock$returningId = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    insert: () => mockInsert(),
  },
}));

mockInsert.mockReturnValue({ values: mockValues });
mockValues.mockReturnValue({ $returningId: mock$returningId });

vi.mock('@/shared/lib/auth/user-auth', () => ({
  validateUserSession: vi.fn(),
  AuthError: class AuthError extends Error {},
}));

vi.mock('@/app/api/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/api/api-auth')>();
  return { ...actual, hashApiKey: vi.fn(() => 'hashed-key-value') };
});

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

function makeRequest(body?: unknown) {
  return new NextRequest('http://localhost:3000/api/api-keys/create', {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/api-keys/create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({ $returningId: mock$returningId });
    mockedValidate.mockResolvedValue(mockSession as never);
  });

  it('creates a key and returns it with id, prefix, lastFour', async () => {
    mock$returningId.mockResolvedValue([{ id: 42 }]);
    const res = await POST(makeRequest({ name: 'My Key' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(42);
    expect(body.name).toBe('My Key');
    expect(body.key).toMatch(/^dak_/);
    expect(body.prefix).toHaveLength(8);
    expect(body.lastFour).toHaveLength(4);
    expect(body.createdAt).toBeDefined();
  });

  it('creates a key without a name', async () => {
    mock$returningId.mockResolvedValue([{ id: 1 }]);
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBeNull();
    expect(body.key).toMatch(/^dak_/);
  });

  it('handles invalid JSON body gracefully', async () => {
    mock$returningId.mockResolvedValue([{ id: 1 }]);
    const req = new NextRequest('http://localhost:3000/api/api-keys/create', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.key).toMatch(/^dak_/);
  });

  it('returns 500 when session validation fails', async () => {
    mockedValidate.mockRejectedValue(new Error('No session'));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('No session');
  });

  it('returns 500 when DB insert fails', async () => {
    mock$returningId.mockRejectedValue(new Error('DB error'));
    const res = await POST(makeRequest({ name: 'test' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('DB error');
  });
});
