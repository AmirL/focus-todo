import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/shared/lib/auth/user-auth', () => ({
  validateUserSession: vi.fn(),
}));

const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockValues = vi.fn();
const mockReturningId = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: () => ({ from: mockFrom }),
    insert: () => ({ values: mockValues }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere });
mockValues.mockReturnValue({ $returningId: mockReturningId });

vi.mock('@/shared/lib/drizzle/schema', () => ({
  goalsTable: { id: 'id', userId: 'userId' },
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeRequest(body: object) {
  return new NextRequest(new URL('http://localhost:3000/api/create-goal'), {
    method: 'POST',
    body: JSON.stringify(body),
  } as never);
}

describe('POST /api/create-goal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere });
    mockValues.mockReturnValue({ $returningId: mockReturningId });
  });

  it('returns 400 when title is missing', async () => {
    const res = await POST(makeRequest({ goal: { listId: 1 } }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Goal title is required');
  });

  it('returns 400 when listId is missing', async () => {
    const res = await POST(makeRequest({ goal: { title: 'My Goal' } }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Goal listId is required (number)');
  });

  it('creates goal successfully', async () => {
    const sampleGoal = { id: 1, title: 'My Goal', listId: 1, userId: 'user-1' };
    mockReturningId.mockResolvedValue([{ id: 1 }]);
    mockWhere.mockResolvedValue([sampleGoal]);

    const res = await POST(makeRequest({ goal: { title: 'My Goal', listId: 1 } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('My Goal');
  });
});
