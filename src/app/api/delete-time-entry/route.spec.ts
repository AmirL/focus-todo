import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/shared/lib/auth/user-auth', () => ({
  validateUserSession: vi.fn(),
}));

const mockDeleteWhere = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    delete: () => ({ where: mockDeleteWhere }),
  },
}));

mockDeleteWhere.mockResolvedValue(undefined);

vi.mock('@/shared/lib/drizzle/schema', () => ({
  timeEntriesTable: { id: 'id', userId: 'userId' },
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeRequest(body: object) {
  return new NextRequest(new URL('http://localhost:3000/api/delete-time-entry'), {
    method: 'POST',
    body: JSON.stringify(body),
  } as never);
}

describe('POST /api/delete-time-entry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockDeleteWhere.mockResolvedValue(undefined);
  });

  it('returns 400 when id is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('id is required');
  });

  it('deletes time entry successfully', async () => {
    const res = await POST(makeRequest({ id: 1 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
