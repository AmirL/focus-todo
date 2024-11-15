import { Button } from '@/components/ui/button';
import { ListsNames } from '@/classes/task';
import { useFilterStore } from '@/store/filterStore';

export function Filters() {
  return (
    <div className="my-4 flex flex-wrap items-center justify-between gap-4">
      <AllButtonGroup />
      <SpecialFiltersGroup />
      <ListFiltersGroup />
    </div>
  );
}

function AllButtonGroup() {
  const { specialFilter, list, setSpecialFilter, setList } = useFilterStore();

  return (
    <div className="flex gap-2">
      <Button
        variant={specialFilter === 'all' && list === '' ? 'default' : 'outline'}
        onClick={() => {
          setSpecialFilter('all');
          setList('');
        }}
      >
        All
      </Button>
    </div>
  );
}

function SpecialFiltersGroup() {
  const { specialFilter, setSpecialFilter } = useFilterStore();

  return (
    <div className="flex gap-2">
      <Button
        variant={specialFilter === 'selected' ? 'default' : 'outline'}
        onClick={() => setSpecialFilter('selected')}
      >
        Selected
      </Button>
      <Button variant={specialFilter === 'future' ? 'default' : 'outline'} onClick={() => setSpecialFilter('future')}>
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
