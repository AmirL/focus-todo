'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';
import { cn } from '@/shared/lib/utils';
import {
  useCurrentInitiativeQuery,
  useChangeInitiativeMutation,
} from '@/shared/api/current-initiative';

export function TodayFocusBanner() {
  const { data, isLoading, error } = useCurrentInitiativeQuery();
  const changeInitiativeMutation = useChangeInitiativeMutation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [pendingListId, setPendingListId] = useState<number | null>(null);

  const todayDate = dayjs().format('YYYY-MM-DD');

  // Get today's initiative
  const todayInitiative = data?.today;
  const existingListId = todayInitiative
    ? todayInitiative.chosenListId ?? todayInitiative.suggestedListId
    : null;

  // Reset pending selection when data changes
  useEffect(() => {
    setPendingListId(null);
  }, [existingListId]);

  if (isLoading) {
    return null;
  }

  if (error || !data) {
    return null;
  }

  const { participatingLists } = data;
  const eligibleLists = participatingLists.filter((list) => list.participatesInInitiative);

  // Don't show banner if no eligible lists or no initiative set for today
  if (eligibleLists.length === 0 || !todayInitiative) {
    return null;
  }

  // Current effective selection (existing or pending)
  const currentListId = pendingListId ?? existingListId;
  const currentList = eligibleLists.find((l) => l.id === currentListId);
  const hasUnsavedChanges = pendingListId !== null && pendingListId !== existingListId;

  const handleSelect = (listId: number) => {
    if (listId === existingListId) {
      // Selecting the already-saved option - clear pending
      setPendingListId(null);
    } else {
      setPendingListId(listId);
    }
    setIsExpanded(false);
  };

  const handleSave = () => {
    if (pendingListId === null) return;

    changeInitiativeMutation.mutate({
      date: todayDate,
      listId: pendingListId,
    });
  };

  const isSaving = changeInitiativeMutation.isPending;

  return (
    <div className="px-2 sm:px-4 mb-4">
      <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary">Today&apos;s Focus:</span>
              <span className="text-sm font-semibold">{currentList?.name ?? 'Not set'}</span>
              {todayInitiative.chosenListId !== null && (
                <span className="text-xs text-muted-foreground">(you chose this)</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pick one task to start your day
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Change dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all',
                  'bg-background border border-border hover:bg-accent',
                  hasUnsavedChanges && 'border-primary'
                )}
              >
                <span>Change</span>
                <ChevronDown
                  className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', isExpanded && 'rotate-180')}
                />
              </button>

              {/* Dropdown menu */}
              {isExpanded && (
                <div className="absolute top-full right-0 mt-1 z-50 min-w-[180px] bg-popover border rounded-lg shadow-lg py-1">
                  {eligibleLists.map((list) => {
                    const isCurrentSelection = list.id === currentListId;
                    const isSaved = list.id === existingListId;

                    return (
                      <button
                        key={list.id}
                        type="button"
                        onClick={() => handleSelect(list.id)}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors',
                          'hover:bg-accent',
                          isCurrentSelection && 'bg-accent'
                        )}
                      >
                        <div className="w-4 shrink-0">
                          {isSaved && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <span className={cn('text-sm', isCurrentSelection && 'font-medium')}>
                          {list.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Save button - only show when there are unsaved changes */}
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      {isExpanded && <div className="fixed inset-0 z-40" onClick={() => setIsExpanded(false)} />}
    </div>
  );
}
