"use client";

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Copy, Plus } from 'lucide-react';
import type { CreatedKey } from '../model/types';

type Props = {
  onGenerate: (name: string | undefined) => void;
  isGenerating: boolean;
  created: CreatedKey | null;
};

export function ApiKeyCreateSection({ onGenerate, isGenerating, created }: Props) {
  const [name, setName] = useState('');

  const copyCreatedKey = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.key);
      // toast is handled globally by caller if needed
    } catch {}
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label htmlFor="api-key-name">Label (optional)</Label>
          <Input
            id="api-key-name"
            placeholder="e.g. Raycast, Zapier, CLI script"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button onClick={() => onGenerate(name || undefined)} disabled={isGenerating}>
          <Plus className="h-4 w-4 mr-2" />
          Generate
        </Button>
      </div>

      {created && (
        <div className="rounded-md border p-3 bg-muted/30">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-medium">New API Key</div>
              <div className="text-xs text-muted-foreground">
                Copy and store it securely. You won’t see it again.
              </div>
              <div className="mt-2 font-mono break-all text-sm">{created.key}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={copyCreatedKey}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
