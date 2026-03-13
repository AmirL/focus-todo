"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBackend } from '@/shared/lib/api';
import toast from 'react-hot-toast';
import type { CreatedKey } from '../model/types';

export function useCreateApiKeyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string | undefined) => {
      return await fetchBackend<CreatedKey>('api-keys/create', { name });
    },
    onSuccess: () => {
      toast.success('API key created');
      qc.invalidateQueries({ queryKey: ['api-keys'] });
    },
    onError: () => toast.error('Failed to create API key'),
  });
}

export function useRevokeApiKeyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await fetchBackend('api-keys/revoke', { id });
    },
    onSuccess: () => {
      toast.success('API key revoked');
      qc.invalidateQueries({ queryKey: ['api-keys'] });
    },
    onError: () => toast.error('Failed to revoke API key'),
  });
}

