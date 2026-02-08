'use client';

import * as React from 'react';
import { TaskModel } from '@/entities/task/model/task';
import dayjs from 'dayjs';
import { SpotlightDisplayItem } from '../model/spotlight';
import { useListsQuery } from '@/shared/api/lists';
import { buildListIdToNameMap } from '@/shared/lib/listUtils';

type Props = {
  items: SpotlightDisplayItem[];
  activeIndex: number;
  onHoverIndex: (i: number) => void;
  onSelect: (task: TaskModel) => void;
};

function formatSubline(task: TaskModel, listNameMap: Map<number, string>) {
  const parts: string[] = [];
  if (task.completedAt) parts.push('Completed');
  if (task.date) parts.push(dayjs(task.date).format('YYYY-MM-DD'));
  const listName = listNameMap.get(task.listId);
  if (listName) parts.push(`List: ${listName}`);
  return parts.join(' • ');
}

export function SpotlightResults({ items, activeIndex, onHoverIndex, onSelect }: Props) {
  const { data: lists = [] } = useListsQuery();
  const listNameMap = buildListIdToNameMap(lists);
  return (
    <ul className="divide-y">
      {items.map((item, idx) => {
        if (item.type === 'active') {
          const task = item.task;
          return (
            <li key={`active-${task.id}`}>
              <button
                className={`w-full text-left px-4 py-3 focus:outline-none ${idx === activeIndex ? 'bg-accent' : 'hover:bg-accent'}`}
                onMouseEnter={() => onHoverIndex(idx)}
                onClick={() => onSelect(task)}
              >
                <div className="font-medium leading-tight">{task.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{formatSubline(task, listNameMap)}</div>
                {task.details ? <div className="line-clamp-2 text-xs text-muted-foreground mt-1">{task.details}</div> : null}
              </button>
            </li>
          );
        }
        const { name, count, newestTask } = item;
        return (
          <li key={`completed-${name}`}>
            <button
              className={`w-full text-left px-4 py-3 focus:outline-none ${idx === activeIndex ? 'bg-accent' : 'hover:bg-accent'}`}
              onMouseEnter={() => onHoverIndex(idx)}
              onClick={() => onSelect(newestTask)}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium leading-tight">{name}</div>
                <div className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-2 rounded-full bg-muted text-xs">
                  {count}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{formatSubline(newestTask, listNameMap)}</div>
              {newestTask.details ? (
                <div className="line-clamp-2 text-xs text-muted-foreground mt-1">{newestTask.details}</div>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default SpotlightResults;
