import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/shared/lib/auth/user-auth', () => ({
  validateUserSession: vi.fn(),
}));

const mockFrom = vi.fn();
const mockWhere = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: () => ({ from: mockFrom }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere });

vi.mock('@/shared/lib/drizzle/schema', () => ({
  goalsTable: { userId: 'userId', deletedAt: 'deletedAt' },
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeRequest() {
  return new NextRequest(new URL('http://localhost:3000/api/get-goals'), {
    method: 'POST',
    body: JSON.stringify({}),
  } as never);
}

describe('POST /api/get-goals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere });
  });

  it('returns goals for authenticated user', async () => {
    const goals = [{ id: 1, title: 'Goal 1', userId: 'user-1' }];
    mockWhere.mockResolvedValue(goals);

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.goals).toHaveLength(1);
  });

  it('returns empty array when no goals', async () => {
    mockWhere.mockResolvedValue([]);

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.goals).toEqual([]);
  });
});
