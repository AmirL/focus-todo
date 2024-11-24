import { Button } from '@/components/ui/button';
import { ListsNames } from '@/classes/task';
import { SpecialFilterEnum, useFilterStore } from '@/store/filterStore';

export function Filters() {
  return (
    <div className="my-4 flex flex-wrap items-center justify-between gap-4">
      <SpecialFiltersGroup />
      <ListFiltersGroup />
    </div>
  );
}

function SpecialFiltersGroup() {
  const { specialFilter, setSpecialFilter } = useFilterStore();

  return (
    <div className="flex gap-2">
      <Button
        variant={specialFilter === SpecialFilterEnum.ACTIVE ? 'default' : 'outline'}
        onClick={() => {
          setSpecialFilter(SpecialFilterEnum.ACTIVE);
        }}
      >
        Active
      </Button>
      <Button
        variant={specialFilter === 'selected' ? 'default' : 'outline'}
        onClick={() => setSpecialFilter(SpecialFilterEnum.SELECTED)}
      >
        Selected
      </Button>
      <Button
        variant={specialFilter === 'future' ? 'default' : 'outline'}
        onClick={() => setSpecialFilter(SpecialFilterEnum.FUTURE)}
      >
        Future
      </Button>
    </div>
  );
}

function ListFiltersGroup() {
  const { list, setList } = useFilterStore();

  return (
    <div className="flex gap-2">
      {ListsNames.map((listName) => (
        <Button key={listName} variant={list === listName ? 'default' : 'outline'} onClick={() => setList(listName)}>
          {listName}
        </Button>
      ))}
    </div>
  );
}
