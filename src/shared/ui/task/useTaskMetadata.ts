import { useState, useCallback } from 'react';

export interface TaskMetadata {
  selectedDuration: number | null;
  selectedListId: number | null;
  isStarred: boolean;
  isBlocker: boolean;
  selectedDate: Date | null;
  selectedGoalId: number | null;
}

export interface UseTaskMetadataReturn {
  metadata: TaskMetadata;
  updateMetadata: (updates: Partial<TaskMetadata>) => void;
  resetMetadata: () => void;
}

const DEFAULT_METADATA: TaskMetadata = {
  selectedDuration: null,
  selectedListId: null,
  isStarred: false,
  isBlocker: false,
  selectedDate: null,
  selectedGoalId: null,
};

export function useTaskMetadata(initialMetadata?: Partial<TaskMetadata>): UseTaskMetadataReturn {
  const [metadata, setMetadata] = useState<TaskMetadata>({
    ...DEFAULT_METADATA,
    ...initialMetadata,
  });

  const updateMetadata = useCallback((updates: Partial<TaskMetadata>) => {
    setMetadata(prev => ({ ...prev, ...updates }));
  }, []);

  const resetMetadata = useCallback(() => {
    setMetadata({ ...DEFAULT_METADATA, ...initialMetadata });
  }, [initialMetadata]);

  return {
    metadata,
    updateMetadata,
    resetMetadata,
  };
}