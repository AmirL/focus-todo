import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/shared/lib/auth/user-auth', () => ({
  validateUserSession: vi.fn(),
}));

const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockSet = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: () => ({ from: mockFrom }),
    update: () => ({ set: mockSet }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere });
mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });

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
  return new NextRequest(new URL('http://localhost:3000/api/update-goal'), {
    method: 'POST',
    body: JSON.stringify(body),
  } as never);
}

const sampleGoal = { id: 1, title: 'Goal', progress: 0, listId: 1, userId: 'user-1' };

describe('POST /api/update-goal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  });

  it('updates goal and returns 200', async () => {
    mockWhere.mockResolvedValue([{ ...sampleGoal, title: 'Updated Goal' }]);

    const res = await POST(makeRequest({ id: 1, goal: { title: 'Updated Goal' } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('Updated Goal');
  });

  it('returns 404 when goal not found', async () => {
    mockWhere.mockResolvedValue([]);

    const res = await POST(makeRequest({ id: 999, goal: { title: 'Updated' } }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Goal not found');
  });

  it('handles deletedAt field', async () => {
    mockWhere.mockResolvedValue([{ ...sampleGoal, deletedAt: new Date() }]);

    const res = await POST(makeRequest({ id: 1, goal: { deletedAt: '2024-06-15T00:00:00Z' } }));
    expect(res.status).toBe(200);
  });

  it('handles setting deletedAt to null', async () => {
    mockWhere.mockResolvedValue([{ ...sampleGoal, deletedAt: null }]);

    const res = await POST(makeRequest({ id: 1, goal: { deletedAt: null } }));
    expect(res.status).toBe(200);
  });
});
