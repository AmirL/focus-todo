export type AiSuggestionField = {
  suggestion: string;
  userReaction: 'accepted' | 'rejected' | null;
};

export type AiSuggestions = Record<string, AiSuggestionField>;
