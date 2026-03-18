"use client";

import type { ApiKeyItem } from '../model/types';

type Props = {
  items: ApiKeyItem[];
};

export function RevokedKeysList({ items }: Props) {
  if (items.length === 0) return null;
  return (
    <div data-cy="revoked-api-keys">
      <div className="text-sm font-medium mb-2">Revoked</div>
      <ul className="space-y-2">
        {items.map((k) => (
          <li key={k.id} data-cy={`revoked-api-key-${k.id}`} className="flex items-center justify-between rounded-md border p-2 opacity-70">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{k.name || 'Untitled'}</div>
              <div className="text-xs text-muted-foreground font-mono">
                {k.prefix}…{k.lastFour}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Revoked</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
