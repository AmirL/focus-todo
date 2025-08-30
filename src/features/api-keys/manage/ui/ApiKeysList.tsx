"use client";

import { Button } from '@/shared/ui/button';
import { Trash2 } from 'lucide-react';
import type { ApiKeyItem } from '../model/types';

type Props = {
  items: ApiKeyItem[];
  isLoading: boolean;
  onRevoke: (id: number) => void;
};

export function ApiKeysList({ items, isLoading, onRevoke }: Props) {
  return (
    <div>
      <div className="text-sm font-medium mb-2">Active Keys</div>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No active API keys</div>
      ) : (
        <ul className="space-y-2">
          {items.map((k) => (
            <li key={k.id} className="flex items-center justify-between rounded-md border p-2">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{k.name || 'Untitled'}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {k.prefix}…{k.lastFour}
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={() => onRevoke(k.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
