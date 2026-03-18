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
  tasksTable: { userId: 'userId', deletedAt: 'deletedAt' },
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeRequest() {
  return new NextRequest(new URL('http://localhost:3000/api/get-tasks'), {
    method: 'POST',
    body: JSON.stringify({}),
  } as never);
}

describe('POST /api/get-tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere });
  });

  it('returns tasks for authenticated user', async () => {
    const tasks = [
      { id: 1, name: 'Task 1', userId: 'user-1' },
      { id: 2, name: 'Task 2', userId: 'user-1' },
    ];
    mockWhere.mockResolvedValue(tasks);

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tasks).toHaveLength(2);
  });

  it('returns empty array when no tasks', async () => {
    mockWhere.mockResolvedValue([]);

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tasks).toEqual([]);
  });
});
