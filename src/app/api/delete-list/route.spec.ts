import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/shared/lib/auth/user-auth', () => ({
  validateUserSession: vi.fn(),
}));

vi.mock('@/shared/lib/db/list-queries', () => ({
  findUserListById: vi.fn(),
  countListUsage: vi.fn(),
  reassignItemsToList: vi.fn(),
  deleteUserList: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { findUserListById, countListUsage, reassignItemsToList, deleteUserList } from '@/shared/lib/db/list-queries';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

const mockedFindById = vi.mocked(findUserListById);
const mockedCountUsage = vi.mocked(countListUsage);
const mockedReassign = vi.mocked(reassignItemsToList);
const mockedDelete = vi.mocked(deleteUserList);

const sampleList = { id: 1, name: 'Work', userId: 'user-1' };

function makeRequest(body: object) {
  return new NextRequest(new URL('http://localhost:3000/api/delete-list'), {
    method: 'POST',
    body: JSON.stringify(body),
  } as never);
}

describe('POST /api/delete-list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
  });

  it('returns 400 when id is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('List ID is required');
  });

  it('returns 404 when list not found', async () => {
    mockedFindById.mockResolvedValue(null as never);
    const res = await POST(makeRequest({ id: 999 }));
    expect(res.status).toBe(404);
  });

  it('returns 400 when list has items and no reassignToListId', async () => {
    mockedFindById.mockResolvedValue(sampleList as never);
    mockedCountUsage.mockResolvedValue({ tasksCount: 3, goalsCount: 1 } as never);

    const res = await POST(makeRequest({ id: 1 }));
    expect(res.status).toBe(400);
  });

  it('deletes list with no items', async () => {
    mockedFindById.mockResolvedValue(sampleList as never);
    mockedCountUsage.mockResolvedValue({ tasksCount: 0, goalsCount: 0 } as never);
    mockedDelete.mockResolvedValue(undefined as never);

    const res = await POST(makeRequest({ id: 1 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('List deleted successfully');
  });

  it('reassigns items and deletes list', async () => {
    mockedFindById.mockImplementation((async (_userId: string, listId: number) => {
      if (listId === 1) return sampleList;
      if (listId === 2) return { id: 2, name: 'Personal', userId: 'user-1' };
      return null;
    }) as never);
    mockedCountUsage.mockResolvedValue({ tasksCount: 2, goalsCount: 0 } as never);
    mockedReassign.mockResolvedValue(undefined as never);
    mockedDelete.mockResolvedValue(undefined as never);

    const res = await POST(makeRequest({ id: 1, reassignToListId: 2 }));
    expect(res.status).toBe(200);
    expect(mockedReassign).toHaveBeenCalledWith('user-1', 1, 2);
  });

  it('returns 404 when target list for reassignment not found', async () => {
    mockedFindById.mockImplementation((async (_userId: string, listId: number) => {
      if (listId === 1) return sampleList;
      return null;
    }) as never);
    mockedCountUsage.mockResolvedValue({ tasksCount: 1, goalsCount: 0 } as never);

    const res = await POST(makeRequest({ id: 1, reassignToListId: 999 }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Target list for reassignment not found');
  });
});
