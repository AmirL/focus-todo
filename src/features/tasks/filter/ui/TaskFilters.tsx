'use client';

import { Button } from '@/shared/ui/button';
import { CheckSquare2, Calendar, Clock, ListTodo, Tag } from 'lucide-react';
import { StatusFilterEnum, useFilterStore } from '@/features/tasks/filter/model/filterStore';
import { ListsNames } from '@/entities/task/model/task';

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
      variant={active ? 'secondary' : 'ghost'}
      className="w-full justify-start"
      onClick={() => setStatusFilter(filter)}
    >
      <Icon className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );
}

function CategoryButton({ category, active }: { category: string; active: boolean }) {
  const { setList } = useFilterStore();

  return (
    <Button variant={active ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setList(category)}>
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
          <FilterButton
            filter={StatusFilterEnum.TODAY}
            active={statusFilter === StatusFilterEnum.TODAY}
            icon={Calendar}
          >
            Today
          </FilterButton>
          <FilterButton
            filter={StatusFilterEnum.TOMORROW}
            active={statusFilter === StatusFilterEnum.TOMORROW}
            icon={Calendar}
          >
            Tomorrow
          </FilterButton>
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
