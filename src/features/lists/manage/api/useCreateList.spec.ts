import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMutateAsync = vi.fn();

vi.mock('@/shared/api/lists', () => ({
  useCreateListMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

// Import after mock setup
import { useCreateList } from './useCreateList';

describe('useCreateList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test the hook's returned function by calling it directly
  // The hook is a thin wrapper, so we extract the logic via the mock
  const getCreateList = () => {
    const hook = useCreateList();
    return hook.createList;
  };

  it('trims name and calls mutateAsync', async () => {
    mockMutateAsync.mockResolvedValue({});
    const createList = getCreateList();

    const success = await createList('  Work  ', true, '  desc  ');

    expect(success).toBe(true);
    expect(mockMutateAsync).toHaveBeenCalledWith({
      name: 'Work',
      description: 'desc',
      participatesInInitiative: true,
      color: null,
    });
  });

  it('returns false for empty name', async () => {
    const createList = getCreateList();

    const success = await createList('   ', true);

    expect(success).toBe(false);
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('returns false on mutation error', async () => {
    mockMutateAsync.mockRejectedValue(new Error('fail'));
    const createList = getCreateList();

    const success = await createList('Work', true);

    expect(success).toBe(false);
  });

  it('passes null description when not provided', async () => {
    mockMutateAsync.mockResolvedValue({});
    const createList = getCreateList();

    await createList('Work', false);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      name: 'Work',
      description: null,
      participatesInInitiative: false,
      color: null,
    });
  });
});
