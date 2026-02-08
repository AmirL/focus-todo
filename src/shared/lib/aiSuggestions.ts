import type { AiSuggestions } from '@/shared/types/aiSuggestions';

export function hasPendingSuggestions(aiSuggestions: AiSuggestions | null | undefined): boolean {
  if (!aiSuggestions) return false;
  return Object.values(aiSuggestions).some((field) => field.userReaction === null);
}

export function getPendingSuggestion(
  aiSuggestions: AiSuggestions | null | undefined,
  fieldName: string
): string | null {
  if (!aiSuggestions) return null;
  const field = aiSuggestions[fieldName];
  if (!field || field.userReaction !== null) return null;
  return field.suggestion;
}
