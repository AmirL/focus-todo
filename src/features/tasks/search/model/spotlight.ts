'use client';

import * as React from 'react';
import { TaskModel, isTaskDeleted } from '@/entities/task/model/task';

// Global shortcut: Cmd/Ctrl+K to open Spotlight
export function useSpotlightShortcut(setOpen: (o: boolean) => void) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key;
      if ((key === 'k' || key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);
}

// Simple fuzzy-subsequence score (lower is better). Returns null if not matched
export function fuzzyScore(needle: string, haystack: string): number | null {
  const n = needle.toLowerCase();
  const h = haystack.toLowerCase();
  if (!n || !h) return null;
  if (h.includes(n)) return 0; // perfect substring match
  let hi = 0;
  let first = -1;
  let last = -1;
  for (let i = 0; i < n.length; i++) {
    const ch = n[i];
    hi = h.indexOf(ch, hi);
    if (hi === -1) return null;
    if (first === -1) first = hi;
    last = hi;
    hi++;
  }
  const span = last - first + 1;
  return span - n.length + first * 0.001; // prioritize tight, early matches
}

export function rankTasks(tasks: TaskModel[], query: string): TaskModel[] {
  const q = query.trim();
  const base = tasks.filter((t) => !isTaskDeleted(t));
  if (!q) return [];

  const ranked = base
    .map((t) => {
      const nameScore = fuzzyScore(q, t.name ?? '');
      const detailsScore = fuzzyScore(q, t.details ?? '');
      const score = [nameScore, detailsScore].filter((s): s is number => s !== null).sort((a, b) => a - b)[0];
      return { t, score: score ?? Number.POSITIVE_INFINITY };
    })
    .filter((r) => Number.isFinite(r.score))
    .sort((a, b) => a.score - b.score)
    .map((r) => r.t);

  return ranked;
}

