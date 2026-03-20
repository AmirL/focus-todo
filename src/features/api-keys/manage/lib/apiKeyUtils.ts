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
