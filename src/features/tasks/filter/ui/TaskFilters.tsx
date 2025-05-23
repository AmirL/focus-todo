'use client';

import { Button } from '@/shared/ui/button';
import { CheckSquare2, Calendar, Clock, ListTodo, Tag } from 'lucide-react';
import { StatusFilterEnum, useFilterStore } from '@/features/tasks/filter/model/filterStore';
import { ListsNames, isTaskToday, isTaskTomorrow, isTaskOverdue } from '@/entities/task/model/task';
import { cn } from '@/shared/lib/utils';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { calculateTotalEstimatedTime, formatTotalDuration } from '../model/calculateTotalEstimatedTime';

function FilterButton({
  filter,
  active,
  children,
  icon: Icon,
}: {
  filter: StatusFilterEnum;
  active: boolean;
  children: React.ReactNode;
  icon: React.ElementType;
}) {
  const { setStatusFilter } = useFilterStore();

  return (
    <Button
      variant={'ghost'}
      className={cn(
        'w-full justify-start',
        active && 'text-primary  bg-primary/10 hover:bg-primary/20 hover:text-primary'
      )}
      onClick={() => setStatusFilter(filter)}
    >
      <Icon className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );
}

function FilterButtonWithTime({
  filter,
  active,
  children,
  icon: Icon,
}: {
  filter: StatusFilterEnum;
  active: boolean;
  children: React.ReactNode;
  icon: React.ElementType;
}) {
  const { setStatusFilter } = useFilterStore();
  const allTasks = useTasksStore((state) => state.tasks);

  // Calculate estimated time for this specific filter
  const filteredTasks = allTasks.filter((task) => {
    if (filter === StatusFilterEnum.TODAY) {
      return isTaskToday(task) || isTaskOverdue(task);
    } else if (filter === StatusFilterEnum.TOMORROW) {
      return isTaskTomorrow(task);
    }
    return false;
  });

  const totalMinutes = calculateTotalEstimatedTime(filteredTasks);
  const formattedTime = formatTotalDuration(totalMinutes);

  return (
    <Button
      variant={'ghost'}
      className={cn(
        'w-full justify-between',
        active && 'text-primary  bg-primary/10 hover:bg-primary/20 hover:text-primary'
      )}
      onClick={() => setStatusFilter(filter)}
    >
      <div className="flex items-center">
        <Icon className="mr-2 h-4 w-4" />
        {children}
      </div>
      {formattedTime && <span className="text-xs text-muted-foreground">{formattedTime}</span>}
    </Button>
  );
}

function CategoryButton({ category, active }: { category: string; active: boolean }) {
  const { setList } = useFilterStore();

  return (
    <Button
      variant={'ghost'}
      className={cn(
        'w-full justify-start',
        active && 'text-primary  bg-primary/10 hover:bg-primary/20 hover:text-primary'
      )}
      onClick={() => setList(category)}
    >
      <Tag className="mr-2 h-4 w-4" />
      {category}
    </Button>
  );
}

export function TaskFilters() {
  const { statusFilter, list } = useFilterStore();

  return (
    <div className="space-y-4">
      <div className="px-2">
        <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">Filters</h2>
        <div className="space-y-1">
          <FilterButton
            filter={StatusFilterEnum.BACKLOG}
            active={statusFilter === StatusFilterEnum.BACKLOG}
            icon={ListTodo}
          >
            Backlog
          </FilterButton>
          <FilterButton
            filter={StatusFilterEnum.SELECTED}
            active={statusFilter === StatusFilterEnum.SELECTED}
            icon={CheckSquare2}
          >
            Selected
          </FilterButton>
          <FilterButtonWithTime
            filter={StatusFilterEnum.TODAY}
            active={statusFilter === StatusFilterEnum.TODAY}
            icon={Calendar}
          >
            Today
          </FilterButtonWithTime>
          <FilterButtonWithTime
            filter={StatusFilterEnum.TOMORROW}
            active={statusFilter === StatusFilterEnum.TOMORROW}
            icon={Calendar}
          >
            Tomorrow
          </FilterButtonWithTime>
          <FilterButton filter={StatusFilterEnum.FUTURE} active={statusFilter === StatusFilterEnum.FUTURE} icon={Clock}>
            Future
          </FilterButton>
        </div>
      </div>

      <div className="px-2">
        <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">Categories</h2>
        <div className="space-y-1">
          {ListsNames.map((category) => (
            <CategoryButton key={category} category={category} active={list === category} />
          ))}
        </div>
      </div>
    </div>
  );
}
