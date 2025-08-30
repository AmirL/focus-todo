'use client';

import * as React from 'react';
import { TaskModel } from '@/entities/task/model/task';
import dayjs from 'dayjs';

type Props = {
  results: TaskModel[];
  activeIndex: number;
  onHoverIndex: (i: number) => void;
  onSelect: (task: TaskModel) => void;
};

function formatSubline(task: TaskModel) {
  const parts: string[] = [];
  if (task.completedAt) parts.push('Completed');
  if (task.date) parts.push(dayjs(task.date).format('YYYY-MM-DD'));
  if (task.list) parts.push(`List: ${task.list}`);
  return parts.join(' • ');
}

export function SpotlightResults({ results, activeIndex, onHoverIndex, onSelect }: Props) {
  return (
    <ul className="divide-y">
      {results.map((task, idx) => (
        <li key={task.id}>
          <button
            className={`w-full text-left px-4 py-3 focus:outline-none ${idx === activeIndex ? 'bg-accent' : 'hover:bg-accent'}`}
            onMouseEnter={() => onHoverIndex(idx)}
            onClick={() => onSelect(task)}
          >
            <div className="font-medium leading-tight">{task.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{formatSubline(task)}</div>
            {task.details ? <div className="line-clamp-2 text-xs text-muted-foreground mt-1">{task.details}</div> : null}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default SpotlightResults;

