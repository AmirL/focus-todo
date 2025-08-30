'use client';

import * as React from 'react';
import { TaskModel } from '@/entities/task/model/task';

export function useSpotlightSelection(results: TaskModel[], onSelect: (t: TaskModel) => void) {
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);

  React.useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1);
  }, [results.length]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min((i < 0 ? -1 : i) + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max((i < 0 ? 0 : i) - 1, 0));
      } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        onSelect(results[activeIndex]);
      }
    },
    [results, activeIndex, onSelect]
  );

  return { activeIndex, setActiveIndex, handleKeyDown } as const;
}

