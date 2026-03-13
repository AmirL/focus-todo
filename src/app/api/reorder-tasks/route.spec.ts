import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockUpdate = vi.fn();
const mockSet = vi.fn();
const mockTransaction = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: (...args: unknown[]) => mockSelect(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

mockSelect.mockReturnValue({ from: mockFrom });
mockFrom.mockReturnValue({ where: mockWhere });
mockUpdate.mockReturnValue({ set: mockSet });
mockSet.mockReturnValue({ where: vi.fn() });

vi.mock('@/app/api/user-auth', () => ({
  validateUserSession: vi.fn(),
  AuthError: class AuthError extends Error {
    constructor(message: string) { super(message); this.name = 'AuthError'; }
  },
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { POST } from './route';
import { validateUserSession } from '@/app/api/user-auth';

const mockedValidate = vi.mocked(validateUserSession);

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/reorder-tasks', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const mockSession = {
  user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
  session: { id: 'session-1' },
};

describe('POST /api/reorder-tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockedValidate.mockResolvedValue(mockSession as never);
  });

  it('returns 400 when taskIds is missing', async () => {
    const res = await POST(makeRequest({ context: { statusFilter: 'active', listId: 1 } }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('taskIds');
  });

  it('returns 400 when taskIds is empty', async () => {
    const res = await POST(makeRequest({ taskIds: [], context: { statusFilter: 'active', listId: 1 } }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('non-empty');
  });

  it('returns 400 when context is missing', async () => {
    const res = await POST(makeRequest({ taskIds: ['1', '2'] }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('context');
  });

  it('returns 400 when context is incomplete', async () => {
    const res = await POST(makeRequest({ taskIds: ['1', '2'], context: { statusFilter: 'active' } }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('context');
  });

  it('returns 403 when some tasks do not belong to user', async () => {
    mockWhere.mockResolvedValue([{ id: 1 }]);
    const res = await POST(makeRequest({
      taskIds: ['1', '2'],
      context: { statusFilter: 'active', listId: 1 },
    }));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('do not belong');
  });

  it('returns 200 and reorders tasks successfully', async () => {
    const taskIds = ['3', '1', '2'];
    mockWhere.mockResolvedValueOnce([{ id: 3 }, { id: 1 }, { id: 2 }]);
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      const txUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({ where: vi.fn() }),
      });
      await fn({ update: txUpdate });
    });
    const updatedTasks = [
      { id: 3, sortOrder: 0 },
      { id: 1, sortOrder: 1 },
      { id: 2, sortOrder: 2 },
    ];
    mockWhere.mockResolvedValueOnce(updatedTasks);

    const res = await POST(makeRequest({
      taskIds,
      context: { statusFilter: 'active', listId: 1 },
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.tasks).toEqual(updatedTasks);
    expect(body.message).toContain('3 tasks');
  });

  it('returns 401 when session validation fails with AuthError', async () => {
    const { AuthError } = await import('@/app/api/user-auth');
    mockedValidate.mockRejectedValue(new AuthError('No session'));
    const res = await POST(makeRequest({
      taskIds: ['1'],
      context: { statusFilter: 'active', listId: 1 },
    }));
    expect(res.status).toBe(401);
  });

  it('returns 500 when database transaction fails', async () => {
    mockWhere.mockResolvedValueOnce([{ id: 1 }]);
    mockTransaction.mockRejectedValue(new Error('DB error'));
    const res = await POST(makeRequest({
      taskIds: ['1'],
      context: { statusFilter: 'active', listId: 1 },
    }));
    expect(res.status).toBe(500);
  });
});
