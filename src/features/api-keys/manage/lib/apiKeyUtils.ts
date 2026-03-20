import type { ApiKeyItem } from '../model/types';

/** Filter keys that are currently active (not revoked) */
export function filterActiveKeys(keys: ApiKeyItem[]): ApiKeyItem[] {
  return keys.filter((k) => !k.revokedAt);
}

/** Filter keys that have been revoked */
export function filterRevokedKeys(keys: ApiKeyItem[]): ApiKeyItem[] {
  return keys.filter((k) => !!k.revokedAt);
}

/** Format a key's display identifier (prefix...lastFour) */
export function formatKeyIdentifier(key: ApiKeyItem): string {
  return `${key.prefix}...${key.lastFour}`;
}

/** Get a display name for an API key (falls back to "Unnamed key") */
export function getKeyDisplayName(key: ApiKeyItem): string {
  return key.name ?? 'Unnamed key';
}

/** Sort keys by creation date, newest first */
export function sortKeysByDate(keys: ApiKeyItem[]): ApiKeyItem[] {
  return [...keys].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
}

/** Format key creation date for display */
export function formatKeyDate(dateStr: string | Date): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Check if a key has been used */
export function hasKeyBeenUsed(key: ApiKeyItem): boolean {
  return key.lastUsedAt !== null;
}
