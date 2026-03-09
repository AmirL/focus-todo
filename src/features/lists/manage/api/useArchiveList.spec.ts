import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMutateAsync = vi.fn();

vi.mock('@/shared/api/lists', () => ({
  useArchiveListMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

import { useArchiveList } from './useArchiveList';

describe('useArchiveList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('archiveList calls mutateAsync with archived: true', async () => {
    mockMutateAsync.mockResolvedValue({});
    const { archiveList } = useArchiveList();

    const success = await archiveList('list-1');

    expect(success).toBe(true);
    expect(mockMutateAsync).toHaveBeenCalledWith({ id: 'list-1', archived: true });
  });

  it('unarchiveList calls mutateAsync with archived: false', async () => {
    mockMutateAsync.mockResolvedValue({});
    const { unarchiveList } = useArchiveList();

    const success = await unarchiveList('list-1');

    expect(success).toBe(true);
    expect(mockMutateAsync).toHaveBeenCalledWith({ id: 'list-1', archived: false });
  });

  it('archiveList returns false on error', async () => {
    mockMutateAsync.mockRejectedValue(new Error('fail'));
    const { archiveList } = useArchiveList();

    const success = await archiveList('list-1');

    expect(success).toBe(false);
  });

  it('unarchiveList returns false on error', async () => {
    mockMutateAsync.mockRejectedValue(new Error('fail'));
    const { unarchiveList } = useArchiveList();

    const success = await unarchiveList('list-1');

    expect(success).toBe(false);
  });
});
