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
  timeEntriesTable: { id: 'id', userId: 'userId' },
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeRequest(body: object) {
  return new NextRequest(new URL('http://localhost:3000/api/update-time-entry'), {
    method: 'POST',
    body: JSON.stringify(body),
  } as never);
}

const sampleEntry = {
  id: 1,
  taskId: 5,
  userId: 'user-1',
  startedAt: new Date('2024-06-15T10:00:00Z'),
  endedAt: new Date('2024-06-15T11:00:00Z'),
  durationMinutes: 60,
};

describe('POST /api/update-time-entry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  });

  it('returns 400 when id is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('id is required');
  });

  it('returns 404 when time entry not found', async () => {
    mockWhere.mockResolvedValue([]);

    const res = await POST(makeRequest({ id: 999 }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Time entry not found');
  });

  it('updates time entry successfully', async () => {
    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve([sampleEntry]);
      return Promise.resolve([{ ...sampleEntry, endedAt: new Date('2024-06-15T12:00:00Z') }]);
    });

    const res = await POST(makeRequest({ id: 1, endedAt: '2024-06-15T12:00:00Z' }));
    expect(res.status).toBe(200);
  });

  it('updates startedAt', async () => {
    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve([sampleEntry]);
      return Promise.resolve([{ ...sampleEntry, startedAt: new Date('2024-06-15T09:00:00Z') }]);
    });

    const res = await POST(makeRequest({ id: 1, startedAt: '2024-06-15T09:00:00Z' }));
    expect(res.status).toBe(200);
  });
});
