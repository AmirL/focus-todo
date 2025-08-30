"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchBackend } from '@/shared/lib/api';
import type { ApiKeyItem } from '../model/types';

export function useApiKeysQuery() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = (await fetchBackend('api-keys/list')) as { keys: ApiKeyItem[] };
      return res.keys;
    },
    staleTime: 30_000,
  });
}

