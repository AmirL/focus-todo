'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Check, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';
import { cn } from '@/shared/lib/utils';
import {
  useCurrentInitiativeQuery,
  useSetInitiativeMutation,
  useChangeInitiativeMutation,
} from '@/shared/api/current-initiative';

const NEGLECT_THRESHOLD_DAYS = 5;

function getDaysLabel(daysSinceLastUsed: number | null): string {
  if (daysSinceLastUsed === null) {
    return 'never used';
  }
  if (daysSinceLastUsed === 0) {
    return 'today';
  }
  if (daysSinceLastUsed === 1) {
    return 'yesterday';
  }
  return `${daysSinceLastUsed}d ago`;
}

function calculateDaysSinceLastUsed(lastUsedDate: string | null): number | null {
  if (!lastUsedDate) {
    return null;
  }
  const today = dayjs().startOf('day');
  const lastUsed = dayjs(lastUsedDate).startOf('day');
  return today.diff(lastUsed, 'day');
}

export function InitiativePicker() {
  const { data, isLoading, error } = useCurrentInitiativeQuery();
  const setInitiativeMutation = useSetInitiativeMutation();
  const changeInitiativeMutation = useChangeInitiativeMutation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [pendingListId, setPendingListId] = useState<number | null>(null);

  // Get tomorrow's date for the change mutation
  const tomorrowDate = dayjs().add(1, 'day').format('YYYY-MM-DD');

  // Determine if we already have a set initiative
  const existingInitiative = data?.tomorrow;
  const existingListId = existingInitiative
    ? existingInitiative.chosenListId ?? existingInitiative.suggestedListId
    : null;

  // Reset pending selection when data changes
  useEffect(() => {
    setPendingListId(null);
  }, [existingListId]);

  if (isLoading) {
    return (
      <div className="px-2 sm:px-4 mb-4">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const { participatingLists, suggestedList, balance } = data;
  const eligibleLists = participatingLists.filter((list) => list.participatesInInitiative);

  if (eligibleLists.length === 0) {
    return null;
  }

  const balanceMap = new Map(balance.map((b) => [b.listId, b.lastUsedDate]));

  const isNotSet = !existingInitiative;

  // Current effective selection (existing or pending)
  const currentListId = pendingListId ?? existingListId ?? suggestedList?.id ?? null;
  const currentList = eligibleLists.find((l) => l.id === currentListId);
  const hasUnsavedChanges = isNotSet
    ? pendingListId !== null
    : pendingListId !== null && pendingListId !== existingListId;

  const handleSelect = (listId: number) => {
    if (!isNotSet && listId === existingListId) {
      // Selecting the already-saved option - clear pending
      setPendingListId(null);
    } else {
      setPendingListId(listId);
    }
    setIsExpanded(false);
  };

  const handleSave = () => {
    const listIdToSave = pendingListId ?? currentListId;
    if (listIdToSave === null) return;

    if (existingInitiative) {
      // Change existing
      changeInitiativeMutation.mutate({
        date: tomorrowDate,
        listId: listIdToSave,
      });
    } else {
      // Set new
      setInitiativeMutation.mutate({
        listId: listIdToSave,
      });
    }
  };

  const isSaving = setInitiativeMutation.isPending || changeInitiativeMutation.isPending;

  return (
    <div className="px-2 sm:px-4 mb-6" data-cy="tomorrow-focus-picker">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground shrink-0">Tomorrow&apos;s focus:</span>

        {/* Dropdown trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            data-cy="tomorrow-focus-dropdown"
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              'bg-secondary/50 hover:bg-secondary',
              existingInitiative && !hasUnsavedChanges && 'bg-primary/10 text-primary'
            )}
          >
            <span>{currentList?.name ?? 'Select category'}</span>
            {isNotSet && !hasUnsavedChanges && (
              <span className="text-xs text-muted-foreground">(suggested)</span>
            )}
            <ChevronDown
              className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')}
            />
          </button>

          {/* Dropdown menu */}
          {isExpanded && (
            <div className="absolute top-full left-0 mt-1 z-50 min-w-[200px] bg-popover border rounded-lg shadow-lg py-1">
              {eligibleLists.map((list) => {
                const lastUsedDate = balanceMap.get(list.id) ?? null;
                const daysSinceLastUsed = calculateDaysSinceLastUsed(lastUsedDate);
                const isNeglected = daysSinceLastUsed !== null && daysSinceLastUsed > NEGLECT_THRESHOLD_DAYS;
                const isSuggested = suggestedList?.id === list.id;
                const isCurrentSelection = list.id === currentListId;
                const isSaved = list.id === existingListId;

                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => handleSelect(list.id)}
                    data-cy={`tomorrow-focus-option-${list.id}`}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                      'hover:bg-accent',
                      isCurrentSelection && 'bg-accent'
                    )}
                  >
                    <div className="w-4 shrink-0">
                      {isSaved && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm truncate', isCurrentSelection && 'font-medium')}>
                          {list.name}
                        </span>
                        {isSuggested && (
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            suggested
                          </span>
                        )}
                        {isNeglected && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{getDaysLabel(daysSinceLastUsed)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Save button - show when there are unsaved changes or when not set yet */}
        {(hasUnsavedChanges || isNotSet) && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            data-cy="tomorrow-focus-save"
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        )}

        {/* Status indicator */}
        {existingInitiative && !hasUnsavedChanges && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Check className="h-3 w-3" />
            Set
          </span>
        )}
      </div>

      {/* Click outside to close */}
      {isExpanded && <div className="fixed inset-0 z-40" onClick={() => setIsExpanded(false)} />}
    </div>
  );
}
