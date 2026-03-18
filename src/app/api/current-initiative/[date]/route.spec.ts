import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/shared/lib/auth/user-auth', () => ({
  validateUserSession: vi.fn(),
}));

vi.mock('@/shared/lib/api/initiative-helpers', () => ({
  isValidDate: vi.fn(),
  toDate: vi.fn(),
  findInitiativeByDate: vi.fn(),
  updateInitiativeChoice: vi.fn(),
  verifyListOwnership: vi.fn(),
}));

vi.mock('@/app/api/initiative/serialize', () => ({
  serializeInitiative: vi.fn((i: unknown) => i),
}));

vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { validateUserSession } from '@/shared/lib/auth/user-auth';
import {
  isValidDate,
  toDate,
  findInitiativeByDate,
  updateInitiativeChoice,
  verifyListOwnership,
} from '@/shared/lib/api/initiative-helpers';
import { GET, PATCH } from './route';

vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);

function makeGetRequest() {
  return new NextRequest(new URL('http://localhost:3000/api/current-initiative/2024-06-15'), {
    method: 'GET',
  } as never);
}

function makePatchRequest(body: object) {
  return new NextRequest(new URL('http://localhost:3000/api/current-initiative/2024-06-15'), {
    method: 'PATCH',
    body: JSON.stringify(body),
  } as never);
}

function makeContext(date: string) {
  return { params: Promise.resolve({ date }) };
}

describe('GET /api/current-initiative/[date]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
  });

  it('returns initiative for valid date', async () => {
    vi.mocked(isValidDate).mockReturnValue(true);
    vi.mocked(toDate).mockReturnValue(new Date('2024-06-15'));
    vi.mocked(findInitiativeByDate).mockResolvedValue({ id: 1, date: new Date('2024-06-15') } as never);

    const res = await GET(makeGetRequest(), makeContext('2024-06-15'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.initiative).toBeTruthy();
    expect(body.initiative.id).toBe(1);
  });

  it('returns 400 for invalid date', async () => {
    vi.mocked(isValidDate).mockReturnValue(false);

    const res = await GET(makeGetRequest(), makeContext('not-a-date'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Invalid date format');
  });

  it('returns 404 when no initiative found', async () => {
    vi.mocked(isValidDate).mockReturnValue(true);
    vi.mocked(toDate).mockReturnValue(new Date('2024-06-15'));
    vi.mocked(findInitiativeByDate).mockResolvedValue(null as never);

    const res = await GET(makeGetRequest(), makeContext('2024-06-15'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain('No initiative found');
  });
});

describe('PATCH /api/current-initiative/[date]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateUserSession).mockResolvedValue({ user: { id: 'user-1' } } as never);
  });

  it('updates initiative with valid body', async () => {
    vi.mocked(isValidDate).mockReturnValue(true);
    vi.mocked(verifyListOwnership).mockResolvedValue({ id: 1, name: 'Work' } as never);
    vi.mocked(toDate).mockReturnValue(new Date('2024-06-15'));
    vi.mocked(findInitiativeByDate).mockResolvedValue({ id: 1, reason: null } as never);
    vi.mocked(updateInitiativeChoice).mockResolvedValue({ id: 1, chosenListId: 1 } as never);

    const res = await PATCH(makePatchRequest({ listId: 1 }), makeContext('2024-06-15'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.initiative).toBeTruthy();
  });

  it('returns 400 for invalid date', async () => {
    vi.mocked(isValidDate).mockReturnValue(false);

    const res = await PATCH(makePatchRequest({ listId: 1 }), makeContext('bad-date'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Invalid date format');
  });

  it('returns 400 for invalid listId', async () => {
    vi.mocked(isValidDate).mockReturnValue(true);

    const res = await PATCH(makePatchRequest({ listId: 'abc' }), makeContext('2024-06-15'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('listId must be a valid number');
  });

  it('returns 400 for missing listId', async () => {
    vi.mocked(isValidDate).mockReturnValue(true);

    const res = await PATCH(makePatchRequest({}), makeContext('2024-06-15'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('listId must be a valid number');
  });

  it('returns 404 when list not found', async () => {
    vi.mocked(isValidDate).mockReturnValue(true);
    vi.mocked(verifyListOwnership).mockResolvedValue(null as never);

    const res = await PATCH(makePatchRequest({ listId: 999 }), makeContext('2024-06-15'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('List not found');
  });

  it('returns 404 when no existing initiative', async () => {
    vi.mocked(isValidDate).mockReturnValue(true);
    vi.mocked(verifyListOwnership).mockResolvedValue({ id: 1 } as never);
    vi.mocked(toDate).mockReturnValue(new Date('2024-06-15'));
    vi.mocked(findInitiativeByDate).mockResolvedValue(null as never);

    const res = await PATCH(makePatchRequest({ listId: 1 }), makeContext('2024-06-15'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain('No initiative found');
  });

  it('returns 404 when update returns null', async () => {
    vi.mocked(isValidDate).mockReturnValue(true);
    vi.mocked(verifyListOwnership).mockResolvedValue({ id: 1 } as never);
    vi.mocked(toDate).mockReturnValue(new Date('2024-06-15'));
    vi.mocked(findInitiativeByDate).mockResolvedValue({ id: 1, reason: null } as never);
    vi.mocked(updateInitiativeChoice).mockResolvedValue(null as never);

    const res = await PATCH(makePatchRequest({ listId: 1 }), makeContext('2024-06-15'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain('Initiative not found after update');
  });

  it('passes reason to updateInitiativeChoice when provided', async () => {
    vi.mocked(isValidDate).mockReturnValue(true);
    vi.mocked(verifyListOwnership).mockResolvedValue({ id: 1 } as never);
    vi.mocked(toDate).mockReturnValue(new Date('2024-06-15'));
    vi.mocked(findInitiativeByDate).mockResolvedValue({ id: 1, reason: 'old reason' } as never);
    vi.mocked(updateInitiativeChoice).mockResolvedValue({ id: 1 } as never);

    await PATCH(makePatchRequest({ listId: 1, reason: 'new reason' }), makeContext('2024-06-15'));

    expect(updateInitiativeChoice).toHaveBeenCalledWith(
      'user-1',
      new Date('2024-06-15'),
      1,
      'new reason',
      'old reason'
    );
  });

  it('strips non-string reason from body', async () => {
    vi.mocked(isValidDate).mockReturnValue(true);
    vi.mocked(verifyListOwnership).mockResolvedValue({ id: 1 } as never);
    vi.mocked(toDate).mockReturnValue(new Date('2024-06-15'));
    vi.mocked(findInitiativeByDate).mockResolvedValue({ id: 1, reason: null } as never);
    vi.mocked(updateInitiativeChoice).mockResolvedValue({ id: 1 } as never);

    await PATCH(makePatchRequest({ listId: 1, reason: 123 }), makeContext('2024-06-15'));

    expect(updateInitiativeChoice).toHaveBeenCalledWith(
      'user-1',
      new Date('2024-06-15'),
      1,
      undefined,
      null
    );
  });
});
