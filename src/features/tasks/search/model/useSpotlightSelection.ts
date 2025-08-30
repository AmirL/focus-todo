'use client';

import * as React from 'react';

export function useSpotlightSelection<T>(items: T[], onSelect: (t: T) => void) {
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);

  React.useEffect(() => {
    setActiveIndex(items.length > 0 ? 0 : -1);
  }, [items.length]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min((i < 0 ? -1 : i) + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max((i < 0 ? 0 : i) - 1, 0));
      } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < items.length) {
        e.preventDefault();
        onSelect(items[activeIndex]);
      }
    },
    [items, activeIndex, onSelect]
  );

  return { activeIndex, setActiveIndex, handleKeyDown } as const;
}
