import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMutateAsync = vi.fn();

vi.mock('@/shared/api/lists', () => ({
  useUpdateListMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

import { useUpdateList } from './useUpdateList';

describe('useUpdateList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getUpdateList = () => useUpdateList().updateList;

  it('trims name and calls mutateAsync', async () => {
    mockMutateAsync.mockResolvedValue({});
    const updateList = getUpdateList();

    const success = await updateList('list-1', '  Updated  ', true, '  new desc  ');

    expect(success).toBe(true);
    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'list-1',
      name: 'Updated',
      description: 'new desc',
      participatesInInitiative: true,
      color: null,
    });
  });

  it('returns false for empty name', async () => {
    const updateList = getUpdateList();

    const success = await updateList('list-1', '   ', true);

    expect(success).toBe(false);
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('returns false on mutation error', async () => {
    mockMutateAsync.mockRejectedValue(new Error('fail'));
    const updateList = getUpdateList();

    const success = await updateList('list-1', 'Work', false);

    expect(success).toBe(false);
  });

  it('passes null description when not provided', async () => {
    mockMutateAsync.mockResolvedValue({});
    const updateList = getUpdateList();

    await updateList('list-1', 'Work', false);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'list-1',
      name: 'Work',
      description: null,
      participatesInInitiative: false,
      color: null,
    });
  });
});
