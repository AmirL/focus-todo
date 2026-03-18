import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/shared/lib/auth/user-auth', () => ({
  validateUserSession: vi.fn(),
}));

vi.mock('@/shared/lib/db/list-queries', () => ({
  getUserLists: vi.fn(),
  createDefaultLists: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { getUserLists, createDefaultLists } from '@/shared/lib/db/list-queries';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeRequest(body?: object) {
  return new NextRequest(new URL('http://localhost:3000/api/get-lists'), {
    method: 'POST',
    ...(body ? { body: JSON.stringify(body) } : {}),
  } as never);
}

describe('POST /api/get-lists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
  });

  it('returns existing lists', async () => {
    const lists = [{ id: 1, name: 'Work' }, { id: 2, name: 'Personal' }];
    vi.mocked(getUserLists).mockResolvedValue(lists as never);

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.lists).toHaveLength(2);
  });

  it('creates default lists when user has none', async () => {
    vi.mocked(getUserLists)
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([{ id: 1, name: 'Work' }, { id: 2, name: 'Personal' }] as never);
    vi.mocked(createDefaultLists).mockResolvedValue(undefined as never);

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(200);
    expect(createDefaultLists).toHaveBeenCalledWith('user-1');
    const body = await res.json();
    expect(body.lists).toHaveLength(2);
  });

  it('handles empty body gracefully', async () => {
    vi.mocked(getUserLists).mockResolvedValue([{ id: 1, name: 'Work' }] as never);

    // Request with no body - should not throw
    const req = new NextRequest(new URL('http://localhost:3000/api/get-lists'), {
      method: 'POST',
    } as never);
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('passes includeArchived flag', async () => {
    vi.mocked(getUserLists).mockResolvedValue([] as never);
    vi.mocked(createDefaultLists).mockResolvedValue(undefined as never);
    vi.mocked(getUserLists).mockResolvedValue([{ id: 1, name: 'Work' }] as never);

    const res = await POST(makeRequest({ includeArchived: true }));
    expect(res.status).toBe(200);
    expect(getUserLists).toHaveBeenCalledWith('user-1', true);
  });
});
