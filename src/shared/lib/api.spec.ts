import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchBackend } from './api';

describe('fetchBackend', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    // Suppress console.error in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('makes a successful GET request', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    });

    const result = await fetchBackend('get-tasks', undefined, 'GET');

    expect(mockFetch).toHaveBeenCalledWith('/api/get-tasks', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toEqual({ data: 'test' });
  });

  it('makes a successful POST request with body', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    });

    const result = await fetchBackend('create-task', { name: 'New task' });

    expect(mockFetch).toHaveBeenCalledWith('/api/create-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New task' }),
    });
    expect(result).toEqual({ id: 1 });
  });

  it('throws an error for non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal server error'),
    });

    await expect(fetchBackend('get-tasks', undefined, 'GET')).rejects.toThrow(
      'HTTP error! status: 500, message: Internal server error'
    );
  });

  it('redirects to login on 401 error', async () => {
    const mockLocation = { pathname: '/dashboard', href: '' };
    vi.stubGlobal('window', { location: mockLocation });

    // Mock dynamic import for react-hot-toast
    vi.mock('react-hot-toast', () => ({
      default: { error: vi.fn() },
    }));

    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    });

    await expect(fetchBackend('get-tasks', undefined, 'GET')).rejects.toThrow(
      'HTTP error! status: 401'
    );
  });

  it('redirects to login on 500 with "No session found"', async () => {
    const mockLocation = { pathname: '/dashboard', href: '' };
    vi.stubGlobal('window', { location: mockLocation });

    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('No session found'),
    });

    await expect(fetchBackend('get-tasks', undefined, 'GET')).rejects.toThrow(
      'HTTP error! status: 500, message: No session found'
    );
  });

  it('defaults to POST method', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await fetchBackend('update-task', { id: 1 });

    expect(mockFetch).toHaveBeenCalledWith('/api/update-task', expect.objectContaining({
      method: 'POST',
    }));
  });

  it('does not include body in request when body is undefined', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await fetchBackend('get-tasks', undefined, 'GET');

    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs).not.toHaveProperty('body');
  });
});
