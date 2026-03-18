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
  listsTable: { id: 'id', userId: 'userId', sortOrder: 'sortOrder' },
}));

vi.mock('@/shared/lib/validation/list-validation', () => ({
  validateCreateListRequest: vi.fn(),
}));

vi.mock('@/shared/lib/db/list-queries', () => ({
  findUserListByName: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { validateCreateListRequest } from '@/shared/lib/validation/list-validation';
import { findUserListByName } from '@/shared/lib/db/list-queries';
import { POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeRequest(body: object) {
  return new NextRequest(new URL('http://localhost:3000/api/create-list'), {
    method: 'POST',
    body: JSON.stringify(body),
  } as never);
}

const sampleList = { id: 1, name: 'Work', userId: 'user-1' };

describe('POST /api/create-list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFrom.mockReturnValue({ where: mockWhere });
    mockValues.mockReturnValue({ $returningId: mockReturningId });
  });

  it('returns 400 on validation error', async () => {
    vi.mocked(validateCreateListRequest).mockReturnValue({ isValid: false, error: 'List name is required' });

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('List name is required');
  });

  it('returns 409 when duplicate name exists', async () => {
    vi.mocked(validateCreateListRequest).mockReturnValue({ isValid: true, name: 'Work' });
    vi.mocked(findUserListByName).mockResolvedValue(sampleList as never);

    const res = await POST(makeRequest({ name: 'Work' }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe('A list with this name already exists');
  });

  it('creates list successfully', async () => {
    vi.mocked(validateCreateListRequest).mockReturnValue({ isValid: true, name: 'New List', description: null, participatesInInitiative: true, color: null });
    vi.mocked(findUserListByName).mockResolvedValue(null as never);
    mockWhere.mockResolvedValue([{ maxSortOrder: 0 }]);
    mockReturningId.mockResolvedValue([{ id: 2 }]);
    // Second call for fetching created list
    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve([{ maxSortOrder: 0 }]);
      return Promise.resolve([{ id: 2, name: 'New List', userId: 'user-1' }]);
    });

    const res = await POST(makeRequest({ name: 'New List' }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe('New List');
  });
});
