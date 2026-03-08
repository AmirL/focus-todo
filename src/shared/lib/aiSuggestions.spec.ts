import { describe, it, expect } from 'vitest';
import type { AiSuggestions } from '@/shared/types/aiSuggestions';
import { hasPendingSuggestions, getPendingSuggestion, hasAnySuggestions } from './aiSuggestions';

describe('hasPendingSuggestions', () => {
  it('returns false for null', () => {
    expect(hasPendingSuggestions(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(hasPendingSuggestions(undefined)).toBe(false);
  });

  it('returns false for empty suggestions', () => {
    expect(hasPendingSuggestions({})).toBe(false);
  });

  it('returns true when there is a pending suggestion (userReaction is null)', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Buy groceries', userReaction: null },
    };
    expect(hasPendingSuggestions(suggestions)).toBe(true);
  });

  it('returns false when all suggestions have been reacted to', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Buy groceries', userReaction: 'accepted' },
      details: { suggestion: 'From the store', userReaction: 'rejected' },
    };
    expect(hasPendingSuggestions(suggestions)).toBe(false);
  });

  it('returns true when at least one suggestion is pending among reacted ones', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Buy groceries', userReaction: 'accepted' },
      details: { suggestion: 'From the store', userReaction: null },
    };
    expect(hasPendingSuggestions(suggestions)).toBe(true);
  });

  describe('with currentValues', () => {
    it('returns false when pending suggestion matches the current value (string)', () => {
      const suggestions: AiSuggestions = {
        name: { suggestion: 'Buy groceries', userReaction: null },
      };
      expect(hasPendingSuggestions(suggestions, { name: 'Buy groceries' })).toBe(false);
    });

    it('returns true when pending suggestion differs from current value', () => {
      const suggestions: AiSuggestions = {
        name: { suggestion: 'Buy groceries', userReaction: null },
      };
      expect(hasPendingSuggestions(suggestions, { name: 'Something else' })).toBe(true);
    });

    it('returns false when pending suggestion matches current numeric value', () => {
      const suggestions: AiSuggestions = {
        estimatedDuration: { suggestion: '30', userReaction: null },
      };
      expect(hasPendingSuggestions(suggestions, { estimatedDuration: 30 })).toBe(false);
    });

    it('returns true when pending suggestion does not match current numeric value', () => {
      const suggestions: AiSuggestions = {
        estimatedDuration: { suggestion: '30', userReaction: null },
      };
      expect(hasPendingSuggestions(suggestions, { estimatedDuration: 60 })).toBe(true);
    });

    it('returns true when current value is null', () => {
      const suggestions: AiSuggestions = {
        name: { suggestion: 'Buy groceries', userReaction: null },
      };
      expect(hasPendingSuggestions(suggestions, { name: null })).toBe(true);
    });

    it('ignores currentValues for fields not in suggestions', () => {
      const suggestions: AiSuggestions = {
        name: { suggestion: 'Buy groceries', userReaction: null },
      };
      expect(hasPendingSuggestions(suggestions, { other: 'value' })).toBe(true);
    });

    it('treats field as pending when currentValues does not include the field', () => {
      const suggestions: AiSuggestions = {
        name: { suggestion: 'Buy groceries', userReaction: null },
      };
      expect(hasPendingSuggestions(suggestions, { details: 'something' })).toBe(true);
    });

    it('skips already-reacted suggestions even if value differs', () => {
      const suggestions: AiSuggestions = {
        name: { suggestion: 'Buy groceries', userReaction: 'rejected' },
      };
      expect(hasPendingSuggestions(suggestions, { name: 'Different' })).toBe(false);
    });
  });
});

describe('getPendingSuggestion', () => {
  it('returns null for null suggestions', () => {
    expect(getPendingSuggestion(null, 'name')).toBeNull();
  });

  it('returns null for undefined suggestions', () => {
    expect(getPendingSuggestion(undefined, 'name')).toBeNull();
  });

  it('returns null when field does not exist', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Buy groceries', userReaction: null },
    };
    expect(getPendingSuggestion(suggestions, 'details')).toBeNull();
  });

  it('returns null when field has been accepted', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Buy groceries', userReaction: 'accepted' },
    };
    expect(getPendingSuggestion(suggestions, 'name')).toBeNull();
  });

  it('returns null when field has been rejected', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Buy groceries', userReaction: 'rejected' },
    };
    expect(getPendingSuggestion(suggestions, 'name')).toBeNull();
  });

  it('returns suggestion when field is pending', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Buy groceries', userReaction: null },
    };
    expect(getPendingSuggestion(suggestions, 'name')).toBe('Buy groceries');
  });

  it('returns null when suggestion matches current string value', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Buy groceries', userReaction: null },
    };
    expect(getPendingSuggestion(suggestions, 'name', 'Buy groceries')).toBeNull();
  });

  it('returns suggestion when it differs from current string value', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Buy groceries', userReaction: null },
    };
    expect(getPendingSuggestion(suggestions, 'name', 'Something else')).toBe('Buy groceries');
  });

  it('returns null when suggestion matches current numeric value', () => {
    const suggestions: AiSuggestions = {
      estimatedDuration: { suggestion: '30', userReaction: null },
    };
    expect(getPendingSuggestion(suggestions, 'estimatedDuration', 30)).toBeNull();
  });

  it('returns suggestion when it differs from current numeric value', () => {
    const suggestions: AiSuggestions = {
      estimatedDuration: { suggestion: '30', userReaction: null },
    };
    expect(getPendingSuggestion(suggestions, 'estimatedDuration', 60)).toBe('30');
  });

  it('returns suggestion when current value is null', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Buy groceries', userReaction: null },
    };
    expect(getPendingSuggestion(suggestions, 'name', null)).toBe('Buy groceries');
  });

  it('returns suggestion when currentValue is not provided (undefined)', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Buy groceries', userReaction: null },
    };
    expect(getPendingSuggestion(suggestions, 'name')).toBe('Buy groceries');
  });

  it('returns null when suggestion is non-numeric but current value is a number', () => {
    const suggestions: AiSuggestions = {
      estimatedDuration: { suggestion: 'abc', userReaction: null },
    };
    expect(getPendingSuggestion(suggestions, 'estimatedDuration', 30)).toBe('abc');
  });
});

describe('hasAnySuggestions', () => {
  it('returns false for null', () => {
    expect(hasAnySuggestions(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(hasAnySuggestions(undefined)).toBe(false);
  });

  it('returns false for empty object', () => {
    expect(hasAnySuggestions({})).toBe(false);
  });

  it('returns true when suggestions exist regardless of reaction status', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Buy groceries', userReaction: 'accepted' },
    };
    expect(hasAnySuggestions(suggestions)).toBe(true);
  });

  it('returns true for pending suggestions', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Buy groceries', userReaction: null },
    };
    expect(hasAnySuggestions(suggestions)).toBe(true);
  });

  it('returns true for multiple suggestions', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Buy groceries', userReaction: null },
      details: { suggestion: 'From the store', userReaction: 'rejected' },
    };
    expect(hasAnySuggestions(suggestions)).toBe(true);
  });
});
