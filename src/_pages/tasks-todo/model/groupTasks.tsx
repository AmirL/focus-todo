import type { TaskModel } from '@/entities/task/model/task';
import type { ListModel } from '@/entities/list';
import { useListsQuery } from '@/shared/api/lists';
import { useListNameMap } from '@/shared/lib/listUtils';

type TaskGroup = {
  id: number;
  name: string;
  tasks: TaskModel[];
};

type GroupTasksOptions = {
  focusListName?: string | null;
};

// Pure function: groups tasks by listId and sorts groups by sidebar order.
// If focusListName is provided, that list's group will appear first.
export function groupTasksByList(
  tasks: TaskModel[],
  lists: ListModel[],
  listNameMap: Map<number, string>,
  options: GroupTasksOptions = {}
): TaskGroup[] {
  const { focusListName } = options;

  // Build groups map keyed by listId
  const groupsMap = tasks.reduce<Record<number, TaskModel[]>>((acc, task) => {
    if (!acc[task.listId]) acc[task.listId] = [];
    acc[task.listId].push(task);
    return acc;
  }, {});

  // Sort group IDs using sidebar order; fallback to alphabetical by name
  const orderIndex = new Map(lists.map((l, i) => [Number(l.id), i] as const));
  const listIds = Object.keys(groupsMap).map(Number).sort((a, b) => {
    const nameA = listNameMap.get(a) ?? '';
    const nameB = listNameMap.get(b) ?? '';

    // Focus list always comes first
    if (focusListName) {
      if (nameA === focusListName) return -1;
      if (nameB === focusListName) return 1;
    }

    const ia = orderIndex.get(a);
    const ib = orderIndex.get(b);
    if (ia != null && ib != null) return ia - ib;
    if (ia != null) return -1;
    if (ib != null) return 1;
    return nameA.localeCompare(nameB);
  });

  return listIds.map((id) => ({
    id,
    name: listNameMap.get(id) ?? 'Unknown',
    tasks: groupsMap[id],
  }));
}

// Hook wrapper: groups tasks by their `listId` and sorts groups according to the lists order from the sidebar.
// If focusListName is provided, that list's group will appear first.
export function useGroupedTasksByList(
  tasks: TaskModel[],
  options: GroupTasksOptions = {}
): TaskGroup[] {
  const { data: lists = [] } = useListsQuery();
  const listNameMap = useListNameMap();
  return groupTasksByList(tasks, lists, listNameMap, options);
}
