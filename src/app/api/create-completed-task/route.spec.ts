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
  tasksTable: { id: 'id', userId: 'userId' },
  timeEntriesTable: { id: 'id', userId: 'userId' },
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
  return new NextRequest(new URL('http://localhost:3000/api/create-completed-task'), {
    method: 'POST',
    body: JSON.stringify(body),
  } as never);
}

describe('POST /api/create-completed-task', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere });
    mockValues.mockReturnValue({ $returningId: mockReturningId });
  });

  it('returns 400 when task name is missing', async () => {
    const res = await POST(makeRequest({ task: { listId: 1 }, startedAt: '2024-06-15T10:00:00Z', endedAt: '2024-06-15T11:00:00Z' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('task.name and task.listId are required');
  });

  it('returns 400 when startedAt/endedAt are missing', async () => {
    const res = await POST(makeRequest({ task: { name: 'Test', listId: 1 } }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('startedAt and endedAt are required');
  });

  it('returns 400 for invalid time range', async () => {
    const res = await POST(makeRequest({
      task: { name: 'Test', listId: 1 },
      startedAt: '2024-06-15T12:00:00Z',
      endedAt: '2024-06-15T10:00:00Z',
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid time range');
  });

  it('creates completed task with time entry', async () => {
    const sampleTask = { id: 1, name: 'Test', listId: 1 };
    const sampleEntry = { id: 1, taskId: 1 };
    mockReturningId.mockResolvedValueOnce([{ id: 1 }]).mockResolvedValueOnce([{ id: 1 }]);
    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve([sampleTask]);
      return Promise.resolve([sampleEntry]);
    });

    const res = await POST(makeRequest({
      task: { name: 'Test', listId: 1 },
      startedAt: '2024-06-15T10:00:00Z',
      endedAt: '2024-06-15T11:00:00Z',
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.task).toBeTruthy();
    expect(body.timeEntry).toBeTruthy();
  });
});
