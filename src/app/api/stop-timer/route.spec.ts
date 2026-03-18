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
  timeEntriesTable: { id: 'id', userId: 'userId', endedAt: 'endedAt' },
}));

vi.mock('../timer-helpers', () => ({
  stopRunningTimers: vi.fn().mockResolvedValue(1),
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeRequest() {
  return new NextRequest(new URL('http://localhost:3000/api/stop-timer'), {
    method: 'POST',
    body: JSON.stringify({}),
  } as never);
}

describe('POST /api/stop-timer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere });
  });

  it('returns 404 when no running timer', async () => {
    mockWhere.mockResolvedValue([]);

    const res = await POST(makeRequest());
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('No running timer');
  });

  it('stops running timer successfully', async () => {
    const runningEntry = { id: 1, taskId: 5, userId: 'user-1', startedAt: new Date(), endedAt: null };
    const stoppedEntry = { ...runningEntry, endedAt: new Date() };
    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve([runningEntry]);
      return Promise.resolve([stoppedEntry]);
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
  });
});
