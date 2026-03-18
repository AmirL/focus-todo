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
  timeEntriesTable: { id: 'id', userId: 'userId' },
}));

vi.mock('../timer-helpers', () => ({
  stopRunningTimers: vi.fn().mockResolvedValue(0),
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeRequest(body: object) {
  return new NextRequest(new URL('http://localhost:3000/api/start-timer'), {
    method: 'POST',
    body: JSON.stringify(body),
  } as never);
}

describe('POST /api/start-timer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere });
    mockValues.mockReturnValue({ $returningId: mockReturningId });
  });

  it('returns 400 when taskId is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('taskId is required');
  });

  it('creates timer entry successfully', async () => {
    const sampleEntry = { id: 1, taskId: 5, userId: 'user-1', startedAt: new Date() };
    mockReturningId.mockResolvedValue([{ id: 1 }]);
    mockWhere.mockResolvedValue([sampleEntry]);

    const res = await POST(makeRequest({ taskId: 5 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.taskId).toBe(5);
  });
});
