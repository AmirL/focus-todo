import { describe, it, expect, beforeEach } from 'vitest';
import { useAddTasksStore } from './addTaskStore';

describe('useAddTasksStore', () => {
  beforeEach(() => {
    useAddTasksStore.setState({ createTaskInput: '' });
  });

  it('has empty initial input', () => {
    expect(useAddTasksStore.getState().createTaskInput).toBe('');
  });

  it('setCreateTaskInput updates the input', () => {
    useAddTasksStore.getState().setCreateTaskInput('Buy groceries');
    expect(useAddTasksStore.getState().createTaskInput).toBe('Buy groceries');
  });

  it('setCreateTaskInput replaces previous value', () => {
    useAddTasksStore.getState().setCreateTaskInput('First task');
    useAddTasksStore.getState().setCreateTaskInput('Second task');
    expect(useAddTasksStore.getState().createTaskInput).toBe('Second task');
  });

  it('setCreateTaskInput can reset to empty string', () => {
    useAddTasksStore.getState().setCreateTaskInput('Some task');
    useAddTasksStore.getState().setCreateTaskInput('');
    expect(useAddTasksStore.getState().createTaskInput).toBe('');
  });
});
