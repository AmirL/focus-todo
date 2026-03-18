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
  listsTable: { id: 'id', userId: 'userId' },
}));

vi.mock('@/shared/lib/validation/list-validation', () => ({
  validateUpdateListRequest: vi.fn(),
  validateArchiveListRequest: vi.fn(),
}));

vi.mock('@/shared/lib/db/list-queries', () => ({
  findUserListById: vi.fn(),
  findUserListByName: vi.fn(),
  setListArchivedStatus: vi.fn(),
  userListFilter: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { validateUpdateListRequest, validateArchiveListRequest } from '@/shared/lib/validation/list-validation';
import { findUserListById, findUserListByName, setListArchivedStatus } from '@/shared/lib/db/list-queries';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

const sampleList = { id: 1, name: 'Work', userId: 'user-1' };

function makeRequest(body: object) {
  return new NextRequest(new URL('http://localhost:3000/api/update-list'), {
    method: 'POST',
    body: JSON.stringify(body),
  } as never);
}

describe('POST /api/update-list (archive toggle)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  });

  it('returns 400 on archive validation error', async () => {
    vi.mocked(validateArchiveListRequest).mockReturnValue({ isValid: false, error: 'archived must be a boolean' });

    const res = await POST(makeRequest({ archived: 'yes', id: 1 }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when list not found for archive', async () => {
    vi.mocked(validateArchiveListRequest).mockReturnValue({ isValid: true, id: 1, archived: true });
    vi.mocked(findUserListById).mockResolvedValue(null as never);

    const res = await POST(makeRequest({ archived: true, id: 1 }));
    expect(res.status).toBe(404);
  });

  it('archives list successfully', async () => {
    vi.mocked(validateArchiveListRequest).mockReturnValue({ isValid: true, id: 1, archived: true });
    vi.mocked(findUserListById).mockResolvedValue(sampleList as never);
    vi.mocked(setListArchivedStatus).mockResolvedValue(undefined as never);
    mockWhere.mockResolvedValue([{ ...sampleList, archivedAt: new Date() }]);

    const res = await POST(makeRequest({ archived: true, id: 1 }));
    expect(res.status).toBe(200);
    expect(setListArchivedStatus).toHaveBeenCalledWith('user-1', 1, true);
  });
});

describe('POST /api/update-list (regular update)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  });

  it('returns 400 on update validation error', async () => {
    vi.mocked(validateUpdateListRequest).mockReturnValue({ isValid: false, error: 'List name is required' });

    const res = await POST(makeRequest({ id: 1, name: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when list not found', async () => {
    vi.mocked(validateUpdateListRequest).mockReturnValue({ isValid: true, id: 1, name: 'Test' });
    vi.mocked(findUserListById).mockResolvedValue(null as never);

    const res = await POST(makeRequest({ id: 1, name: 'Test' }));
    expect(res.status).toBe(404);
  });

  it('returns 409 when duplicate name exists', async () => {
    vi.mocked(validateUpdateListRequest).mockReturnValue({ isValid: true, id: 1, name: 'Personal' });
    vi.mocked(findUserListById).mockResolvedValue(sampleList as never);
    vi.mocked(findUserListByName).mockResolvedValue({ id: 2, name: 'Personal' } as never);

    const res = await POST(makeRequest({ id: 1, name: 'Personal' }));
    expect(res.status).toBe(409);
  });

  it('updates list successfully', async () => {
    vi.mocked(validateUpdateListRequest).mockReturnValue({ isValid: true, id: 1, name: 'Updated' });
    vi.mocked(findUserListById).mockResolvedValue(sampleList as never);
    vi.mocked(findUserListByName).mockResolvedValue(null as never);
    mockWhere.mockResolvedValue([{ ...sampleList, name: 'Updated' }]);

    const res = await POST(makeRequest({ id: 1, name: 'Updated' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('Updated');
  });
});
