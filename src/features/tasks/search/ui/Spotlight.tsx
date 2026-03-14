'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Search } from 'lucide-react';
import { useSpotlightOpen } from '../model/useSpotlightOpen';
import { useSpotlightQuery } from '../model/useSpotlightQuery';
import { useSpotlightSelection } from '../model/useSpotlightSelection';
import { useSpotlightSelectTask } from '../model/useSpotlightSelectTask';
import { buildSpotlightDisplay, SpotlightDisplayItem } from '../model/spotlight';
import { SpotlightHeader } from './SpotlightHeader';
import { SpotlightResults } from './SpotlightResults';

type SpotlightProps = {
  buttonClassName?: string;
};

export function Spotlight({ buttonClassName }: SpotlightProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { open, setOpen } = useSpotlightOpen();
  const { query, setQuery, results, isLoading } = useSpotlightQuery();
  const { selectTask } = useSpotlightSelectTask(setOpen);
  const items = React.useMemo(() => buildSpotlightDisplay(results), [results]);
  const { activeIndex, setActiveIndex, handleKeyDown } = useSpotlightSelection<SpotlightDisplayItem>(
    items,
    (item) => (item.type === 'active' ? selectTask(item.task) : selectTask(item.newestTask))
  );

  React.useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={buttonClassName} aria-label="Search tasks" data-cy="search-button">
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <SpotlightHeader
          inputRef={inputRef}
          query={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading tasks…</div>
          ) : query.trim().length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">Type to search your tasks</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No matching tasks</div>
          ) : (
            <SpotlightResults
              items={items}
              activeIndex={activeIndex}
              onHoverIndex={setActiveIndex}
              onSelect={selectTask}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
