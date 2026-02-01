'use client';

import { AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import { cn } from '@/shared/lib/utils';
import { useCurrentInitiativeQuery } from '@/shared/api/current-initiative';

const NEGLECT_THRESHOLD_DAYS = 5;

function getDaysAgoLabel(lastUsedDate: string | null): string {
  if (!lastUsedDate) {
    return 'never';
  }
  const today = dayjs().startOf('day');
  const lastUsed = dayjs(lastUsedDate).startOf('day');
  const daysSince = today.diff(lastUsed, 'day');

  if (daysSince === 0) {
    return 'today';
  }
  if (daysSince === 1) {
    return '1 day ago';
  }
  return `${daysSince} days ago`;
}

function calculateDaysSince(lastUsedDate: string | null): number | null {
  if (!lastUsedDate) {
    return null;
  }
  const today = dayjs().startOf('day');
  const lastUsed = dayjs(lastUsedDate).startOf('day');
  return today.diff(lastUsed, 'day');
}

export function BalanceIndicator() {
  const { data, isLoading } = useCurrentInitiativeQuery();

  if (isLoading) {
    return null;
  }

  if (!data || !data.balance || data.balance.length === 0) {
    return null;
  }

  const { balance, participatingLists } = data;

  // Only show lists that participate in initiative
  const participatingListIds = new Set(
    participatingLists
      .filter((l) => l.participatesInInitiative)
      .map((l) => l.id)
  );

  const balanceItems = balance
    .filter((b) => participatingListIds.has(b.listId))
    .sort((a, b) => {
      // Sort by days since last used (most neglected first)
      const daysA = calculateDaysSince(a.lastUsedDate);
      const daysB = calculateDaysSince(b.lastUsedDate);
      // Items never used go to the top
      if (daysA === null && daysB === null) return 0;
      if (daysA === null) return -1;
      if (daysB === null) return 1;
      return daysB - daysA;
    });

  if (balanceItems.length === 0) {
    return null;
  }

  return (
    <div className="px-2 py-3">
      <h3 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
        Focus Balance
      </h3>
      <div className="space-y-1">
        {balanceItems.map((item) => {
          const daysSince = calculateDaysSince(item.lastUsedDate);
          const isNeglected = daysSince !== null && daysSince > NEGLECT_THRESHOLD_DAYS;
          const isNeverUsed = daysSince === null;

          return (
            <div
              key={item.listId}
              className={cn(
                'flex items-center justify-between px-2 py-1.5 rounded-md text-sm',
                isNeglected && 'bg-amber-500/10'
              )}
            >
              <span className="truncate">{item.listName}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={cn(
                    'text-xs text-muted-foreground',
                    isNeglected && 'text-amber-600 dark:text-amber-500'
                  )}
                >
                  {getDaysAgoLabel(item.lastUsedDate)}
                </span>
                {(isNeglected || isNeverUsed) && (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
