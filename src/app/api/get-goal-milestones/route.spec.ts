import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/shared/lib/auth/user-auth', () => ({
  validateUserSession: vi.fn(),
}));

const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: () => ({ from: mockFrom }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy });
mockWhere.mockReturnValue({ orderBy: mockOrderBy });

vi.mock('@/shared/lib/drizzle/schema', () => ({
  goalsTable: { id: 'id', userId: 'userId' },
  goalMilestonesTable: { id: 'id', goalId: 'goalId', createdAt: 'createdAt' },
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeRequest(body: object) {
  return new NextRequest(new URL('http://localhost:3000/api/get-goal-milestones'), {
    method: 'POST',
    body: JSON.stringify(body),
  } as never);
}

describe('POST /api/get-goal-milestones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
  });

  it('returns 404 when goal not found', async () => {
    mockWhere.mockResolvedValueOnce([]);

    const res = await POST(makeRequest({ goalId: 999 }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Goal not found');
  });

  it('returns milestones for a goal', async () => {
    const milestones = [{ id: 1, goalId: 1, progress: 50, description: 'Halfway' }];
    mockWhere.mockResolvedValueOnce([{ id: 1, userId: 'user-1' }]);
    mockOrderBy.mockResolvedValue(milestones);

    const res = await POST(makeRequest({ goalId: 1 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.milestones).toHaveLength(1);
  });
});
