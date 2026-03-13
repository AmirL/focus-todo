import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock DB
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

// Mock auth
vi.mock('@/app/api/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/api/api-auth')>();
  return { ...actual, getUserIdFromApiKey: vi.fn() };
});

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

// Mock list-queries
vi.mock('@/shared/lib/db/list-queries', () => ({
  findUserListById: vi.fn(),
  findUserListByName: vi.fn(),
  countListUsage: vi.fn(),
  reassignItemsToList: vi.fn(),
  deleteUserList: vi.fn(),
  setListArchivedStatus: vi.fn(),
  userListFilter: vi.fn(),
}));

import { GET, PATCH, DELETE } from './route';
import { getUserIdFromApiKey, ApiAuthError } from '@/app/api/api-auth';
import {
  findUserListById,
  findUserListByName,
  countListUsage,
  reassignItemsToList,
  deleteUserList,
  setListArchivedStatus,
} from '@/shared/lib/db/list-queries';

const mockedGetUserId = vi.mocked(getUserIdFromApiKey);
const mockedFindById = vi.mocked(findUserListById);
const mockedFindByName = vi.mocked(findUserListByName);
const mockedCountUsage = vi.mocked(countListUsage);
const mockedReassign = vi.mocked(reassignItemsToList);
const mockedDeleteList = vi.mocked(deleteUserList);
const mockedSetArchived = vi.mocked(setListArchivedStatus);

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as never);
}

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

const sampleList = {
  id: 1,
  name: 'Work',
  description: 'Work tasks',
  color: null as string | null,
  userId: 'user-1',
  isDefault: true,
  participatesInInitiative: true,
  sortOrder: 0,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  archivedAt: null,
};

describe('GET /api/lists/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no API key', async () => {
    mockedGetUserId.mockRejectedValue(new ApiAuthError('API key required'));
    const res = await GET(makeRequest('http://localhost:3000/api/lists/1'), makeContext('1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid ID', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await GET(makeRequest('http://localhost:3000/api/lists/abc'), makeContext('abc'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid list ID');
  });

  it('returns 404 when list not found', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(null as never);
    const res = await GET(makeRequest('http://localhost:3000/api/lists/999'), makeContext('999'));
    expect(res.status).toBe(404);
  });

  it('returns list with serialized dates', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(sampleList);

    const res = await GET(makeRequest('http://localhost:3000/api/lists/1'), makeContext('1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.list.name).toBe('Work');
    expect(body.list.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(body.list.archivedAt).toBeNull();
  });
});

describe('PATCH /api/lists/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  });

  it('returns 401 when no API key', async () => {
    mockedGetUserId.mockRejectedValue(new ApiAuthError('API key required'));
    const res = await PATCH(
      makeRequest('http://localhost:3000/api/lists/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid ID', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await PATCH(
      makeRequest('http://localhost:3000/api/lists/abc', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      }),
      makeContext('abc')
    );
    expect(res.status).toBe(400);
  });

  it('returns 404 when list not found', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(null as never);
    const res = await PATCH(
      makeRequest('http://localhost:3000/api/lists/999', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      }),
      makeContext('999')
    );
    expect(res.status).toBe(404);
  });

  it('handles archive toggle', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(sampleList);
    mockedSetArchived.mockResolvedValue(undefined as never);
    mockWhere.mockResolvedValue([{ ...sampleList, archivedAt: new Date() }]);

    const res = await PATCH(
      makeRequest('http://localhost:3000/api/lists/1', {
        method: 'PATCH',
        body: JSON.stringify({ archived: true }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(200);
    expect(mockedSetArchived).toHaveBeenCalledWith('user-1', 1, true);
  });

  it('returns 400 when archived is not boolean', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(sampleList);

    const res = await PATCH(
      makeRequest('http://localhost:3000/api/lists/1', {
        method: 'PATCH',
        body: JSON.stringify({ archived: 'yes' }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('archived must be a boolean');
  });

  it('returns 400 when name is empty string', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(sampleList);

    const res = await PATCH(
      makeRequest('http://localhost:3000/api/lists/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: '' }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when name exceeds 255 characters', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(sampleList);

    const res = await PATCH(
      makeRequest('http://localhost:3000/api/lists/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'a'.repeat(256) }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(400);
  });

  it('returns 409 when duplicate name exists', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(sampleList);
    mockedFindByName.mockResolvedValue({ ...sampleList, id: 2, name: 'Other' });

    const res = await PATCH(
      makeRequest('http://localhost:3000/api/lists/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Other' }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(409);
  });

  it('allows same name for same list (no-op rename)', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(sampleList);
    mockedFindByName.mockResolvedValue(sampleList); // same ID
    mockWhere.mockResolvedValue([sampleList]);

    const res = await PATCH(
      makeRequest('http://localhost:3000/api/lists/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Work' }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(200);
  });

  it('returns 400 when no valid fields to update', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(sampleList);

    const res = await PATCH(
      makeRequest('http://localhost:3000/api/lists/1', {
        method: 'PATCH',
        body: JSON.stringify({}),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('No valid fields to update');
  });

  it('updates description and returns 200', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(sampleList);
    mockWhere.mockResolvedValue([{ ...sampleList, description: 'Updated desc' }]);

    const res = await PATCH(
      makeRequest('http://localhost:3000/api/lists/1', {
        method: 'PATCH',
        body: JSON.stringify({ description: 'Updated desc' }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.list.description).toBe('Updated desc');
  });

  it('updates participatesInInitiative', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(sampleList);
    mockWhere.mockResolvedValue([{ ...sampleList, participatesInInitiative: false }]);

    const res = await PATCH(
      makeRequest('http://localhost:3000/api/lists/1', {
        method: 'PATCH',
        body: JSON.stringify({ participatesInInitiative: false }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/lists/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no API key', async () => {
    mockedGetUserId.mockRejectedValue(new ApiAuthError('API key required'));
    const res = await DELETE(makeRequest('http://localhost:3000/api/lists/1'), makeContext('1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid ID', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await DELETE(makeRequest('http://localhost:3000/api/lists/abc'), makeContext('abc'));
    expect(res.status).toBe(400);
  });

  it('returns 404 when list not found', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(null as never);
    const res = await DELETE(makeRequest('http://localhost:3000/api/lists/999'), makeContext('999'));
    expect(res.status).toBe(404);
  });

  it('returns 400 when list has items and no reassignTo', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(sampleList);
    mockedCountUsage.mockResolvedValue({ tasksCount: 5, goalsCount: 2 });

    const res = await DELETE(makeRequest('http://localhost:3000/api/lists/1'), makeContext('1'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.tasksCount).toBe(5);
    expect(body.goalsCount).toBe(2);
  });

  it('deletes list with no items', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(sampleList);
    mockedCountUsage.mockResolvedValue({ tasksCount: 0, goalsCount: 0 });
    mockedDeleteList.mockResolvedValue(undefined as never);

    const res = await DELETE(makeRequest('http://localhost:3000/api/lists/1'), makeContext('1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('List deleted successfully');
  });

  it('reassigns items and deletes list', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockImplementation((async (_userId: string, listId: number) => {
      if (listId === 1) return sampleList;
      if (listId === 2) return { ...sampleList, id: 2, name: 'Personal' };
      return null;
    }) as never);
    mockedCountUsage.mockResolvedValue({ tasksCount: 3, goalsCount: 1 });
    mockedReassign.mockResolvedValue(undefined as never);
    mockedDeleteList.mockResolvedValue(undefined as never);

    const res = await DELETE(
      makeRequest('http://localhost:3000/api/lists/1?reassignTo=2'),
      makeContext('1')
    );
    expect(res.status).toBe(200);
    expect(mockedReassign).toHaveBeenCalledWith('user-1', 1, 2);
    expect(mockedDeleteList).toHaveBeenCalledWith('user-1', 1);
  });

  it('returns 400 for invalid reassignTo ID', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockResolvedValue(sampleList);
    mockedCountUsage.mockResolvedValue({ tasksCount: 1, goalsCount: 0 });

    const res = await DELETE(
      makeRequest('http://localhost:3000/api/lists/1?reassignTo=abc'),
      makeContext('1')
    );
    expect(res.status).toBe(400);
  });

  it('returns 404 when target list for reassignment not found', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindById.mockImplementation((async (_userId: string, listId: number) => {
      if (listId === 1) return sampleList;
      return null;
    }) as never);
    mockedCountUsage.mockResolvedValue({ tasksCount: 1, goalsCount: 0 });

    const res = await DELETE(
      makeRequest('http://localhost:3000/api/lists/1?reassignTo=999'),
      makeContext('1')
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Target list for reassignment not found');
  });
});
