import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMutateAsync = vi.fn();

vi.mock('@/shared/api/lists', () => ({
  useDeleteListMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

import { useDeleteList } from './useDeleteList';

describe('useDeleteList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getDeleteList = () => useDeleteList().deleteList;

  it('calls mutateAsync with id', async () => {
    mockMutateAsync.mockResolvedValue({});
    const deleteList = getDeleteList();

    const success = await deleteList('list-1');

    expect(success).toBe(true);
    expect(mockMutateAsync).toHaveBeenCalledWith({ id: 'list-1' });
  });

  it('returns false on mutation error', async () => {
    mockMutateAsync.mockRejectedValue(new Error('fail'));
    const deleteList = getDeleteList();

    const success = await deleteList('list-1');

    expect(success).toBe(false);
  });
});
