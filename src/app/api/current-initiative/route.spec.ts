import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/shared/lib/auth/user-auth', () => ({
  validateUserSession: vi.fn(),
}));

vi.mock('@/shared/lib/api/initiative-helpers', () => ({
  fetchTodayTomorrowInitiative: vi.fn(),
  parseCreateInitiativeBody: vi.fn(),
  createInitiative: vi.fn(),
}));

vi.mock('@/app/api/initiative/serialize', () => ({
  serializeInitiative: vi.fn((i: unknown) => i),
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import { fetchTodayTomorrowInitiative, parseCreateInitiativeBody, createInitiative } from '@/shared/lib/api/initiative-helpers';
import { GET, POST } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeRequest(body?: object) {
  return new NextRequest(new URL('http://localhost:3000/api/current-initiative'), {
    method: body ? 'POST' : 'GET',
    ...(body ? { body: JSON.stringify(body) } : {}),
  } as never);
}

describe('GET /api/current-initiative', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
  });

  it('returns today and tomorrow initiatives', async () => {
    vi.mocked(fetchTodayTomorrowInitiative).mockResolvedValue({
      todayInitiative: { id: 1, date: new Date('2024-06-15') } as never,
      tomorrowInitiative: null,
      suggestedList: { id: 1, name: 'Work' } as never,
      balance: [],
      participatingLists: [],
    });

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.today).toBeTruthy();
    expect(body.tomorrow).toBeNull();
    expect(body.balance).toEqual([]);
  });

  it('returns null for both when no initiatives exist', async () => {
    vi.mocked(fetchTodayTomorrowInitiative).mockResolvedValue({
      todayInitiative: null,
      tomorrowInitiative: null,
      suggestedList: null,
      balance: [],
      participatingLists: [],
    });

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.today).toBeNull();
    expect(body.tomorrow).toBeNull();
  });
});

describe('POST /api/current-initiative', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
  });

  it('returns 400 on validation error', async () => {
    vi.mocked(parseCreateInitiativeBody).mockReturnValue({ error: 'listId must be a valid number' });

    const res = await POST(makeRequest({ listId: 'invalid' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('listId must be a valid number');
  });

  it('creates initiative successfully', async () => {
    vi.mocked(parseCreateInitiativeBody).mockReturnValue({ listId: 1 });
    vi.mocked(createInitiative).mockResolvedValue({
      initiative: { id: 1, userId: 'user-1' } as never,
    });

    const res = await POST(makeRequest({ listId: 1 }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.initiative).toBeTruthy();
  });

  it('returns error from createInitiative', async () => {
    vi.mocked(parseCreateInitiativeBody).mockReturnValue({ listId: 999 });
    vi.mocked(createInitiative).mockResolvedValue({
      error: 'List not found',
      status: 404,
    });

    const res = await POST(makeRequest({ listId: 999 }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('List not found');
  });
});
