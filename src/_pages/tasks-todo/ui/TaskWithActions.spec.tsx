import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskWithActions } from './TaskWithActions';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
    setActivatorNodeRef: vi.fn(),
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => null } },
}));

vi.mock('@/entities/task/ui/Task', () => ({
  Task: ({ task }: { task: TaskModel }) => (
    <div data-testid="task">{task.name}</div>
  ),
}));

vi.mock('@/features/tasks/edit', () => ({
  EditTaskButton: () => <button>Edit</button>,
}));

vi.mock('@/features/tasks/actions', () => ({
  DeleteButton: () => <button>Delete</button>,
  ReAddButton: () => null,
  SnoozeButton: () => null,
  StarButton: () => null,
  BlockerButton: () => null,
}));

function makeTask(overrides: Partial<TaskModel> = {}): TaskModel {
  return createInstance(TaskModel, {
    id: 'task-1',
    name: 'Test Task',
    details: '',
    selectedAt: null,
    date: null,
    completedAt: null,
    listId: 1,
    deletedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    estimatedDuration: null,
    isBlocker: false,
    sortOrder: 0,
    aiSuggestions: null,
    goalId: null,
    ...overrides,
  });
}

describe('TaskWithActions', () => {
  it('renders task with drag handle and action buttons', () => {
    const task = makeTask({ name: 'My Task' });

    render(<TaskWithActions task={task} />);

    expect(screen.getByTestId('task')).toBeDefined();
    expect(screen.getByText('My Task')).toBeDefined();
  });
});
