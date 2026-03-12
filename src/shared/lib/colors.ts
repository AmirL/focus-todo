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

/**
 * Hex color values for each list color name.
 * Used by chart components that need actual color values (e.g., recharts).
 */
export const LIST_COLOR_HEX: Record<ListColor, string> = {
  blue: '#3b82f6',
  violet: '#8b5cf6',
  emerald: '#10b981',
  orange: '#f97316',
  red: '#ef4444',
  pink: '#ec4899',
  cyan: '#06b6d4',
  yellow: '#eab308',
  slate: '#64748b',
  amber: '#f59e0b',
};

/**
 * Get the hex color for a list color name, with a fallback.
 */
export function getListColorHex(colorName: string | null | undefined): string {
  if (colorName && isValidListColor(colorName)) {
    return LIST_COLOR_HEX[colorName];
  }
  return LIST_COLOR_HEX.slate;
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
