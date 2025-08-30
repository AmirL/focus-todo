'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { useTasksQuery } from '@/shared/api/tasks';
import { TaskModel, isTaskDeleted } from '@/entities/task/model/task';
import { Search } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import dayjs from 'dayjs';

type SpotlightProps = {
  buttonClassName?: string;
};

export function Spotlight({ buttonClassName }: SpotlightProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { data: tasks = [], isLoading } = useTasksQuery();

  React.useEffect(() => {
    if (open) {
      // Slight delay to ensure dialog content is mounted before focusing
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = tasks.filter((t) => !isTaskDeleted(t));
    if (!q) return base;
    return base.filter((t) =>
      [t.name, t.details || '']
        .join(' \n ')
        .toLowerCase()
        .includes(q)
    );
  }, [tasks, query]);

  function formatSubline(task: TaskModel) {
    const parts: string[] = [];
    if (task.completedAt) parts.push('Completed');
    if (task.date) parts.push(dayjs(task.date).format('YYYY-MM-DD'));
    if (task.list) parts.push(`List: ${task.list}`);
    return parts.join(' • ');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={buttonClassName} aria-label="Search tasks">
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search all tasks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 px-0"
              aria-label="Search all tasks"
            />
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading tasks…</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No matching tasks</div>
          ) : (
            <ul className="divide-y">
              {results.map((task) => (
                <li key={task.id}>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-accent focus:bg-accent focus:outline-none"
                    onClick={() => setOpen(false)}
                  >
                    <div className="font-medium leading-tight">{task.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{formatSubline(task)}</div>
                    {task.details ? (
                      <div className="line-clamp-2 text-xs text-muted-foreground mt-1">{task.details}</div>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Spotlight;

