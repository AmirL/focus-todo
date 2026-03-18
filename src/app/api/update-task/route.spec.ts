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
  tasksTable: { id: 'id', userId: 'userId' },
}));

vi.mock('@/shared/lib/utils', () => ({
  parseDateFields: (obj: unknown) => obj,
  TaskDateKeys: [],
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeRequest(body: object) {
  return new NextRequest(new URL('http://localhost:3000/api/update-task'), {
    method: 'POST',
    body: JSON.stringify(body),
  } as never);
}

const sampleTask = { id: 1, name: 'Test', listId: 1, userId: 'user-1' };

describe('POST /api/update-task', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  });

  it('updates task and returns 200', async () => {
    mockWhere.mockResolvedValue([{ ...sampleTask, name: 'Updated' }]);

    const res = await POST(makeRequest({ id: 1, task: { name: 'Updated' } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('Updated');
  });

  it('returns 404 when task not found', async () => {
    mockWhere.mockResolvedValue([]);

    const res = await POST(makeRequest({ id: 999, task: { name: 'Updated' } }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Task not found');
  });
});
