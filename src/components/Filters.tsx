import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { ListsNames } from '@/classes/task';

export function Filters({ filter, setFilter }: { filter: string; setFilter: Dispatch<SetStateAction<string>> }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Button variant={filter === 'All' ? 'default' : 'outline'} onClick={() => setFilter('All')}>
        All
      </Button>
      <Button variant={filter === 'Today' ? 'default' : 'outline'} onClick={() => setFilter('Today')}>
        Today
      </Button>
      <Button variant={filter === 'Future' ? 'default' : 'outline'} onClick={() => setFilter('Future')}>
        Future
      </Button>
      {ListsNames.map((list) => (
        <Button key={list} variant={filter === list ? 'default' : 'outline'} onClick={() => setFilter(list)}>
          {list}
        </Button>
      ))}
    </div>
  );
}
