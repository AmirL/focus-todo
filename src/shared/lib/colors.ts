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

/**
 * Tailwind class sets for each list color.
 * Used by timeline components, list items, and color pickers.
 */
interface ColorClasses {
  bg: string;
  border: string;
  text: string;
  hover: string;
  swatch: string; // solid background for small swatches
}

const COLOR_CLASS_MAP: Record<ListColor, ColorClasses> = {
  blue: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', hover: 'hover:bg-blue-200', swatch: 'bg-blue-500' },
  violet: { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-800', hover: 'hover:bg-violet-200', swatch: 'bg-violet-500' },
  emerald: { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800', hover: 'hover:bg-emerald-200', swatch: 'bg-emerald-500' },
  orange: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', hover: 'hover:bg-orange-200', swatch: 'bg-orange-500' },
  red: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', hover: 'hover:bg-red-200', swatch: 'bg-red-500' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800', hover: 'hover:bg-pink-200', swatch: 'bg-pink-500' },
  cyan: { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-800', hover: 'hover:bg-cyan-200', swatch: 'bg-cyan-500' },
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', hover: 'hover:bg-yellow-200', swatch: 'bg-yellow-500' },
  slate: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-800', hover: 'hover:bg-slate-200', swatch: 'bg-slate-500' },
  amber: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800', hover: 'hover:bg-amber-200', swatch: 'bg-amber-500' },
};

const DEFAULT_COLOR_CLASSES: ColorClasses = COLOR_CLASS_MAP.emerald;

/**
 * Get Tailwind classes for a color name. Falls back to emerald for unknown colors.
 */
export function getColorClasses(color: string | null | undefined): ColorClasses {
  if (color && isValidListColor(color)) {
    return COLOR_CLASS_MAP[color];
  }
  return DEFAULT_COLOR_CLASSES;
}

/**
 * Human-readable display names for colors.
 */
export const COLOR_DISPLAY_NAMES: Record<ListColor, string> = {
  blue: 'Blue',
  violet: 'Violet',
  emerald: 'Emerald',
  orange: 'Orange',
  red: 'Red',
  pink: 'Pink',
  cyan: 'Cyan',
  yellow: 'Yellow',
  slate: 'Slate',
  amber: 'Amber',
};
