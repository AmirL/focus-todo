'use client';

import { Button } from '@/shared/ui/button';
import { CheckSquare2, Calendar, Clock, ListTodo, Tag } from 'lucide-react';
import { StatusFilterEnum, useFilterStore } from '@/features/tasks/filter/model/filterStore';
import { isTaskToday, isTaskTomorrow, isTaskOverdue } from '@/entities/task/model/task';
import { cn } from '@/shared/lib/utils';
import { useTasksQuery } from '@/shared/api/tasks';
import { useListsQuery } from '@/shared/api/lists';
import { useCurrentInitiativeQuery } from '@/shared/api/current-initiative';
import { calculateTotalEstimatedTime } from '../model/calculateTotalEstimatedTime';
import { formatTotalDuration } from '@/shared/lib/format-duration';
import { useSidebar } from '@/shared/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { navigateHome } from '@/features/tasks/filter/model/filterUrl';

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
  const { setStatusFilter, list } = useFilterStore();
  const { isMobile, toggleSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Button
      variant={'ghost'}
      className={cn(
        'w-full justify-start',
        active && 'text-primary  bg-primary/10 hover:bg-primary/20 hover:text-primary'
      )}
      onClick={() => {
        setStatusFilter(filter);
        navigateHome(router, pathname, filter, list);
        if (isMobile) toggleSidebar();
      }}
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
  const { setStatusFilter, list } = useFilterStore();
  const { data: allTasks = [] } = useTasksQuery();
  const { isMobile, toggleSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

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
      onClick={() => {
        setStatusFilter(filter);
        navigateHome(router, pathname, filter, list);
        if (isMobile) toggleSidebar();
      }}
    >
      <div className="flex items-center">
        <Icon className="mr-2 h-4 w-4" />
        {children}
      </div>
      {formattedTime && <span className="text-xs text-muted-foreground">{formattedTime}</span>}
    </Button>
  );
}

function CategoryButton({
  category,
  active,
  isTodaysFocus,
}: {
  category: string;
  active: boolean;
  isTodaysFocus: boolean;
}) {
  const { setList, statusFilter } = useFilterStore();
  const { isMobile, toggleSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Button
      variant={'ghost'}
      className={cn(
        'w-full justify-between',
        active && 'text-primary  bg-primary/10 hover:bg-primary/20 hover:text-primary'
      )}
      onClick={() => {
        const nextList = active ? '' : category;
        setList(category);
        navigateHome(router, pathname, statusFilter, nextList);
        if (isMobile) toggleSidebar();
      }}
    >
      <div className="flex items-center">
        <Tag className="mr-2 h-4 w-4" />
        {category}
      </div>
      {isTodaysFocus && (
        <span
          className="h-2 w-2 rounded-full bg-primary"
          title="Today's focus"
        />
      )}
    </Button>
  );
}

export function TaskFilters() {
  const { statusFilter, list } = useFilterStore();
  const { data: lists = [], isLoading } = useListsQuery();
  const { data: initiativeData } = useCurrentInitiativeQuery();

  // Determine today's focus list ID (initiative uses number IDs)
  const todaysFocusListId = initiativeData?.today
    ? (initiativeData.today.chosenListId ?? initiativeData.today.suggestedListId)
    : null;

  // Find the name of today's focus list
  // Note: ListModel.id is typed as string but runtime value is number from API
  const todaysFocusListName = todaysFocusListId
    ? lists.find((l) => Number(l.id) === todaysFocusListId)?.name ?? null
    : null;

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
          {isLoading ? (
            <div className="px-2 text-sm text-muted-foreground">Loading...</div>
          ) : (
            lists.map((listItem) => (
              <CategoryButton
                key={listItem.id}
                category={listItem.name}
                active={list === listItem.name}
                isTodaysFocus={listItem.name === todaysFocusListName}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
