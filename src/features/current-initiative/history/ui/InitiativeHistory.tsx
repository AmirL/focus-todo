'use client';

import { useInitiativeHistoryQuery } from '@/shared/api/current-initiative';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import dayjs from 'dayjs';

export function InitiativeHistory() {
  const { data, isLoading, error } = useInitiativeHistoryQuery(30);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Focus History</CardTitle>
          <CardDescription>Last 30 days of daily focus selections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Focus History</CardTitle>
          <CardDescription>Last 30 days of daily focus selections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive text-sm">Failed to load history</div>
        </CardContent>
      </Card>
    );
  }

  const initiatives = data?.initiatives ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus History</CardTitle>
        <CardDescription>Last 30 days of daily focus selections</CardDescription>
      </CardHeader>
      <CardContent>
        {initiatives.length === 0 ? (
          <div className="text-muted-foreground text-sm">No focus history yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-cy="initiative-history-table">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium">Date</th>
                  <th className="text-left py-2 pr-4 font-medium">Suggested</th>
                  <th className="text-left py-2 pr-4 font-medium">Chosen</th>
                  <th className="text-left py-2 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                {initiatives.map((initiative) => {
                  const wasChanged = initiative.chosenListId !== null &&
                    initiative.chosenListId !== initiative.suggestedListId;

                  return (
                    <tr key={initiative.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-4">
                        {formatHistoryDate(initiative.date)}
                      </td>
                      <td className="py-2 pr-4">
                        {initiative.suggestedListName ?? '-'}
                      </td>
                      <td className="py-2 pr-4">
                        {wasChanged ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            {initiative.chosenListName ?? '-'}
                          </span>
                        ) : (
                          initiative.effectiveListName ?? '-'
                        )}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {initiative.reason ?? '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatHistoryDate(dateValue: string | Date): string {
  const date = dayjs(dateValue);
  const today = dayjs();
  const yesterday = today.subtract(1, 'day');

  if (date.isSame(today, 'day')) {
    return 'Today';
  }
  if (date.isSame(yesterday, 'day')) {
    return 'Yesterday';
  }
  return date.format('MMM D');
}
