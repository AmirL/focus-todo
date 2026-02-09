import type { AiSuggestions } from '@/shared/types/aiSuggestions';

export function hasPendingSuggestions(
  aiSuggestions: AiSuggestions | null | undefined,
  currentValues?: Record<string, string | number | null | undefined>
): boolean {
  if (!aiSuggestions) return false;
  return Object.entries(aiSuggestions).some(([fieldName, field]) => {
    if (field.userReaction !== null) return false;
    if (currentValues && currentValues[fieldName] !== undefined) {
      return !isSuggestionMatchingCurrentValue(field.suggestion, currentValues[fieldName]!);
    }
    return true;
  });
}

export function getPendingSuggestion(
  aiSuggestions: AiSuggestions | null | undefined,
  fieldName: string,
  currentValue?: string | number | null
): string | null {
  if (!aiSuggestions) return null;
  const field = aiSuggestions[fieldName];
  if (!field || field.userReaction !== null) return null;
  if (currentValue !== undefined && isSuggestionMatchingCurrentValue(field.suggestion, currentValue)) {
    return null;
  }
  return field.suggestion;
}

export function hasAnySuggestions(aiSuggestions: AiSuggestions | null | undefined): boolean {
  if (!aiSuggestions) return false;
  return Object.keys(aiSuggestions).length > 0;
}

function isSuggestionMatchingCurrentValue(
  suggestion: string,
  currentValue: string | number | null
): boolean {
  if (currentValue === null || currentValue === undefined) return false;
  if (typeof currentValue === 'number') {
    const parsed = parseInt(suggestion, 10);
    return !isNaN(parsed) && parsed === currentValue;
  }
  return suggestion === currentValue;
}
