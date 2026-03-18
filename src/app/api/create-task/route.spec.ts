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
}));

vi.mock('@/shared/lib/utils', () => ({
  parseDateFields: (obj: unknown) => obj,
  TaskDateKeys: [],
}));

vi.mock('@/app/api/tasks/serialize', () => ({
  serializeTask: (t: unknown) => t,
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeRequest(body: object) {
  return new NextRequest(new URL('http://localhost:3000/api/create-task'), {
    method: 'POST',
    body: JSON.stringify(body),
  } as never);
}

describe('POST /api/create-task', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere });
    mockValues.mockReturnValue({ $returningId: mockReturningId });
  });

  it('returns 400 when name is missing', async () => {
    const res = await POST(makeRequest({ task: { listId: 1 } }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Task name is required');
  });

  it('returns 400 when name is empty string', async () => {
    const res = await POST(makeRequest({ task: { name: '  ', listId: 1 } }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when listId is missing', async () => {
    const res = await POST(makeRequest({ task: { name: 'Test' } }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Task listId is required (number)');
  });

  it('returns 400 when listId is not a number', async () => {
    const res = await POST(makeRequest({ task: { name: 'Test', listId: 'abc' } }));
    expect(res.status).toBe(400);
  });

  it('creates task successfully', async () => {
    const sampleTask = { id: 1, name: 'Test Task', listId: 1, userId: 'user-1' };
    mockReturningId.mockResolvedValue([{ id: 1 }]);
    mockWhere.mockResolvedValue([sampleTask]);

    const res = await POST(makeRequest({ task: { name: 'Test Task', listId: 1 } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
  });
});
