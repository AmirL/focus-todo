import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/shared/lib/auth/user-auth', () => ({
  validateUserSession: vi.fn(),
}));

const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockSet = vi.fn();
const mockValues = vi.fn();
const mockReturningId = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: () => ({ from: mockFrom }),
    insert: () => ({ values: mockValues }),
    update: () => ({ set: mockSet }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere });
mockValues.mockReturnValue({ $returningId: mockReturningId });
mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });

vi.mock('@/shared/lib/drizzle/schema', () => ({
  goalsTable: { id: 'id', userId: 'userId' },
  goalMilestonesTable: { id: 'id', goalId: 'goalId' },
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeRequest(body: object) {
  return new NextRequest(new URL('http://localhost:3000/api/create-goal-milestone'), {
    method: 'POST',
    body: JSON.stringify(body),
  } as never);
}

describe('POST /api/create-goal-milestone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere });
    mockValues.mockReturnValue({ $returningId: mockReturningId });
    mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  });

  it('returns 404 when goal not found', async () => {
    mockWhere.mockResolvedValueOnce([]);

    const res = await POST(makeRequest({ goalId: 999, progress: 50 }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Goal not found');
  });

  it('creates milestone and updates goal progress', async () => {
    const milestone = { id: 1, goalId: 1, progress: 50, description: 'Halfway' };
    const updatedGoal = { id: 1, title: 'Goal', progress: 50, userId: 'user-1' };

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve([{ id: 1, userId: 'user-1' }]); // goal check
      if (callCount === 2) return Promise.resolve([milestone]); // milestone fetch
      return Promise.resolve([updatedGoal]); // goal fetch
    });
    mockReturningId.mockResolvedValue([{ id: 1 }]);

    const res = await POST(makeRequest({ goalId: 1, progress: 50, description: 'Halfway' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.milestone).toBeTruthy();
    expect(body.goal).toBeTruthy();
  });
});
