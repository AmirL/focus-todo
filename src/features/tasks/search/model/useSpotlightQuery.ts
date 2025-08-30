'use client';

import * as React from 'react';
import { useTasksQuery } from '@/shared/api/tasks';
import { rankTasks } from './spotlight';

export function useSpotlightQuery() {
  const [query, setQuery] = React.useState('');
  const { data: tasks = [], isLoading } = useTasksQuery();
  const results = React.useMemo(() => rankTasks(tasks, query), [tasks, query]);
  return { query, setQuery, results, isLoading } as const;
}

