'use client';

import { useState } from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';
import dayjs from 'dayjs';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import { useCurrentInitiativeQuery, useSetInitiativeMutation } from '@/shared/api/current-initiative';

const NEGLECT_THRESHOLD_DAYS = 5;

interface ListButtonProps {
  list: {
    id: number;
    name: string;
  };
  daysSinceLastUsed: number | null;
  isSelected: boolean;
  isSuggested: boolean;
  onClick: () => void;
}

function ListButton({ list, daysSinceLastUsed, isSelected, isSuggested, onClick }: ListButtonProps) {
  const isNeglected = daysSinceLastUsed !== null && daysSinceLastUsed > NEGLECT_THRESHOLD_DAYS;
  const daysLabel = getDaysLabel(daysSinceLastUsed);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all min-w-[100px]',
        isSelected
          ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
          : 'border-muted hover:border-muted-foreground/50',
        isSuggested && !isSelected && 'border-dashed border-primary/50'
      )}
    >
      {isNeglected && (
        <AlertTriangle className="absolute -top-2 -right-2 h-4 w-4 text-amber-500" />
      )}
      {isSuggested && (
        <Sparkles className="absolute -top-2 -left-2 h-4 w-4 text-primary" />
      )}
      <span className="font-medium text-sm">{list.name}</span>
      <span className="text-xs text-muted-foreground mt-1">{daysLabel}</span>
    </button>
  );
}

function getDaysLabel(daysSinceLastUsed: number | null): string {
  if (daysSinceLastUsed === null) {
    return 'never';
  }
  if (daysSinceLastUsed === 0) {
    return 'today';
  }
  if (daysSinceLastUsed === 1) {
    return '1 day ago';
  }
  return `${daysSinceLastUsed} days ago`;
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
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  if (isLoading) {
    return (
      <Card className="mx-2 sm:mx-4 mb-4">
        <CardContent className="py-4">
          <div className="text-muted-foreground text-center">Loading initiative data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null;
  }

  // If tomorrow's initiative is already set, don't show the picker
  if (data.tomorrow) {
    return null;
  }

  const { participatingLists, suggestedList, balance } = data;

  // Only show lists that participate in initiative
  const eligibleLists = participatingLists.filter((list) => list.participatesInInitiative);

  if (eligibleLists.length === 0) {
    return null;
  }

  // Create a map of list id to days since last used
  const balanceMap = new Map(balance.map((b) => [b.listId, b.lastUsedDate]));

  const handleConfirm = () => {
    if (selectedListId === null) {
      return;
    }

    setInitiativeMutation.mutate({
      listId: selectedListId,
      reason: reason.trim() || undefined,
    });
  };

  const effectiveSelectedId = selectedListId ?? suggestedList?.id ?? null;

  return (
    <Card className="mx-2 sm:mx-4 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Tomorrow&apos;s Focus</CardTitle>
        {suggestedList && (
          <p className="text-sm text-muted-foreground">
            Suggested: <span className="font-medium text-primary">{suggestedList.name}</span>{' '}
            <span className="text-xs">(longest ago)</span>
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {eligibleLists.map((list) => {
            const lastUsedDate = balanceMap.get(list.id) ?? null;
            const daysSinceLastUsed = calculateDaysSinceLastUsed(lastUsedDate);
            const isSuggested = suggestedList?.id === list.id;
            const isSelected = effectiveSelectedId === list.id;

            return (
              <ListButton
                key={list.id}
                list={list}
                daysSinceLastUsed={daysSinceLastUsed}
                isSelected={isSelected}
                isSuggested={isSuggested}
                onClick={() => setSelectedListId(list.id)}
              />
            );
          })}
        </div>

        {selectedListId !== null && selectedListId !== suggestedList?.id && (
          <div className="space-y-2">
            <label htmlFor="initiative-reason" className="text-sm text-muted-foreground">
              Reason (optional)
            </label>
            <Input
              id="initiative-reason"
              placeholder="Why this category?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="max-w-md"
            />
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleConfirm}
            disabled={effectiveSelectedId === null || setInitiativeMutation.isPending}
          >
            {setInitiativeMutation.isPending ? 'Setting...' : 'Confirm'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
