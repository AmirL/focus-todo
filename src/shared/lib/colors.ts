/**
 * Predefined color palette for lists.
 * Colors are stored as name strings, not hex codes.
 */
export const LIST_COLORS = [
  'blue',
  'violet',
  'emerald',
  'orange',
  'red',
  'pink',
  'cyan',
  'yellow',
  'slate',
  'amber',
] as const;

export type ListColor = (typeof LIST_COLORS)[number];

export function isValidListColor(value: unknown): value is ListColor {
  return typeof value === 'string' && LIST_COLORS.includes(value as ListColor);
}

export function validateListColor(value: unknown): { isValid: boolean; error?: string } {
  if (value === null || value === undefined) {
    return { isValid: true };
  }
  if (!isValidListColor(value)) {
    return {
      isValid: false,
      error: `Invalid color. Must be one of: ${LIST_COLORS.join(', ')}`,
    };
  }
  return { isValid: true };
}
