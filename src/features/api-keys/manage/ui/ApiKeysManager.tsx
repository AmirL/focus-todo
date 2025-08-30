"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { ApiKeyCreateSection } from './ApiKeyCreateSection';
import { ApiKeysList } from './ApiKeysList';
import { RevokedKeysList } from './RevokedKeysList';
import { useApiKeysQuery } from '../api/queries';
import { useCreateApiKeyMutation, useRevokeApiKeyMutation } from '../api/mutations';
import type { CreatedKey } from '../model/types';

export function ApiKeysManager() {
  const { data: keys = [], isLoading } = useApiKeysQuery();
  const [created, setCreated] = useState<CreatedKey | null>(null);

  const createMutation = useCreateApiKeyMutation();
  const revokeMutation = useRevokeApiKeyMutation();

  const activeKeys = useMemo(() => keys.filter((k) => !k.revokedAt), [keys]);
  const revokedKeys = useMemo(() => keys.filter((k) => !!k.revokedAt), [keys]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Generate and revoke API keys for external access
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ApiKeyCreateSection
            onGenerate={(name) =>
              createMutation.mutate(name, {
                onSuccess: (createdKey) => setCreated(createdKey),
              })
            }
            isGenerating={createMutation.isPending}
            created={created}
          />

          <ApiKeysList
            items={activeKeys}
            isLoading={isLoading}
            onRevoke={(id) => revokeMutation.mutate(id)}
          />

          <RevokedKeysList items={revokedKeys} />
        </div>
      </CardContent>
    </Card>
  );
}
