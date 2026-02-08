import { useApplyFilters } from '@/features/tasks/filter/model/filterTasks';
import { useSortedTasks } from '../model/sortTasks';
import { useTasksLoader } from '../api/useTasksLoader';
import { useGroupedTasksByList } from '../model/groupTasks';
import { useFilterStore, StatusFilterEnum } from '@/features/tasks/filter/model/filterStore';
import { useReorderStore, useReorderMutation } from '@/features/tasks/reorder';
import { ErrorState } from './ErrorState';
import { TaskWithActions } from './TaskWithActions';
import { TaskModel } from '@/entities/task/model/task';
import { useTempSelectStore } from '@/features/tasks/temp-select';
import { useCurrentInitiativeQuery } from '@/shared/api/current-initiative';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';

export function Tasks() {
  const { allTasks, isLoading, error } = useTasksLoader();
  const { statusFilter, listId: selectedListId } = useFilterStore();
  const { setOptimisticTasks, setIsDragging } = useReorderStore();
  const { clearSelections } = useTempSelectStore();
  const reorderMutation = useReorderMutation();
  const [activeTask, setActiveTask] = useState<TaskModel | null>(null);
  const { data: initiativeData } = useCurrentInitiativeQuery();

  const filteredTasks = useApplyFilters(allTasks);
  const tasks = useSortedTasks(filteredTasks);

  // Get focus list name for Today/Selected views
  const shouldPrioritizeFocus = statusFilter === StatusFilterEnum.TODAY || statusFilter === StatusFilterEnum.SELECTED;
  const todayInitiative = initiativeData?.today;
  const focusListId = todayInitiative
    ? todayInitiative.chosenListId ?? todayInitiative.suggestedListId
    : null;
  const focusListName = shouldPrioritizeFocus && focusListId
    ? initiativeData?.participatingLists.find((l) => l.id === focusListId)?.name ?? null
    : null;

  const groups = useGroupedTasksByList(tasks, { focusListName });

  // Clear temp selections when filter changes
  useEffect(() => {
    clearSelections();
  }, [statusFilter, selectedListId, clearSelections]);

  // Configure sensors for touch and mouse
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
      setActiveTask(task);
      setIsDragging(true);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    console.log('Drag end event:', { activeId: active.id, overId: over?.id, over, activeData: active.data, overData: over?.data });

    setActiveTask(null);
    setIsDragging(false);

    if (!over || active.id === over.id) {
      console.log('Early return - no over or same ID');
      return;
    }

    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;

    // Find which group contains the active task
    const activeGroup = groups.find((group) =>
      group.tasks.some((task) => task.id === activeTaskId)
    );

    // Find which group contains the over task
    const overGroup = groups.find((group) =>
      group.tasks.some((task) => task.id === overTaskId)
    );

    // Only allow reordering within the same group
    if (!activeGroup || !overGroup || activeGroup.id !== overGroup.id) {
      return;
    }

    const activeGroupTasks = activeGroup.tasks;
    const oldIndex = activeGroupTasks.findIndex((task) => task.id === activeTaskId);
    const newIndex = activeGroupTasks.findIndex((task) => task.id === overTaskId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    // Create optimistic reordered tasks for this group
    const reorderedGroupTasks = arrayMove(activeGroupTasks, oldIndex, newIndex);

    // Create optimistic update by reconstructing the entire task list with reordered group
    const optimisticTasks = [];
    const processedGroups = new Set();

    for (const task of tasks) {
      if (task.listId === activeGroup.id && !processedGroups.has(task.listId)) {
        // Add all reordered tasks for this group
        optimisticTasks.push(...reorderedGroupTasks);
        processedGroups.add(task.listId);
      } else if (task.listId !== activeGroup.id) {
        // Add tasks from other groups as-is
        optimisticTasks.push(task);
      }
      // Skip remaining tasks from the reordered group (already added)
    }

    setOptimisticTasks(optimisticTasks);

    // Prepare API call
    const reorderedTaskIds = reorderedGroupTasks.map((task) => task.id);
    const context = {
      statusFilter: statusFilter,
      listId: activeGroup.id,
    };

    // Execute mutation
    reorderMutation.mutate({
      taskIds: reorderedTaskIds,
      context,
    });
  };

  if (error) return <ErrorState title="Error loading tasks" error={error} />;

  if (isLoading && allTasks.length === 0) {
    return <div className="flex justify-center items-center h-5">Loading...</div>;
  }

  if (tasks.length === 0) {
    return <p className="text-center text-muted-foreground">No tasks found.</p>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <section className="pb-20">
        {groups.map((group) => (
          <div key={group.id} className="mt-16 first:mt-0">
            <h3 className="px-4 text-base font-semibold text-primary">{group.name}</h3>
            <SortableContext
              items={group.tasks.map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul>
                {group.tasks.map((task) => (
                  <TaskWithActions key={task.id} task={task} />
                ))}
              </ul>
            </SortableContext>
          </div>
        ))}
      </section>

      <DragOverlay>
        {activeTask ? (
          <div className="bg-white border border-border rounded-lg shadow-lg opacity-80">
            <TaskWithActions task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
