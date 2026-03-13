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

vi.mock('../user-auth', () => ({
  validateUserSession: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { POST } from './route';
import { validateUserSession } from '../user-auth';

const mockedValidate = vi.mocked(validateUserSession);

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/reorder-lists', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const mockSession = {
  user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
  session: { id: 'session-1' },
};

describe('POST /api/reorder-lists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockedValidate.mockResolvedValue(mockSession as never);
  });

  it('returns 400 when listIds is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('listIds');
  });

  it('returns 400 when listIds is empty', async () => {
    const res = await POST(makeRequest({ listIds: [] }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('non-empty');
  });

  it('returns 403 when some lists do not belong to user', async () => {
    mockWhere.mockResolvedValue([{ id: 1 }]); // only 1 of 2 found
    const res = await POST(makeRequest({ listIds: ['1', '2'] }));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('do not belong');
  });

  it('returns 200 and reorders lists successfully', async () => {
    const listIds = ['2', '1', '3'];
    mockWhere.mockResolvedValueOnce([{ id: 2 }, { id: 1 }, { id: 3 }]); // ownership check
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      const txUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({ where: vi.fn() }),
      });
      await fn({ update: txUpdate });
    });
    const updatedLists = [
      { id: 2, sortOrder: 0 },
      { id: 1, sortOrder: 1 },
      { id: 3, sortOrder: 2 },
    ];
    mockWhere.mockResolvedValueOnce(updatedLists); // fetch updated

    const res = await POST(makeRequest({ listIds }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.lists).toEqual(updatedLists);
    expect(body.message).toContain('3 lists');
  });

  it('returns 500 when session validation fails', async () => {
    mockedValidate.mockRejectedValue(new Error('No session'));
    const res = await POST(makeRequest({ listIds: ['1'] }));
    expect(res.status).toBe(500);
  });

  it('returns 500 when database transaction fails', async () => {
    mockWhere.mockResolvedValueOnce([{ id: 1 }]);
    mockTransaction.mockRejectedValue(new Error('DB error'));
    const res = await POST(makeRequest({ listIds: ['1'] }));
    expect(res.status).toBe(500);
  });
});
