'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/shared/ui/input';

type Props = {
  inputRef: React.RefObject<HTMLInputElement>;
  query: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export function SpotlightHeader({ inputRef, query, onChange, onKeyDown }: Props) {
  return (
    <div className="border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search all tasks..."
          value={query}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className="border-0 focus-visible:ring-0 px-0"
          aria-label="Search all tasks"
        />
        <div className="ml-auto text-xs text-muted-foreground hidden sm:block">⌘K / Ctrl+K</div>
      </div>
    </div>
  );
}


