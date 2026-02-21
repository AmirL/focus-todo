import { describe, it, expect } from 'vitest';
import { cloneInstance, createInstance } from '@/shared/lib/instance-tools';

describe('cloneInstance', () => {
  it('should create a clone with updated properties', () => {
    const original = { name: 'Task 1', completed: false, priority: 1 };
    const clone = cloneInstance(original, { completed: true });

    expect(clone.name).toBe('Task 1');
    expect(clone.completed).toBe(true);
    expect(clone.priority).toBe(1);
  });

  it('should not mutate the original object', () => {
    const original = { name: 'Task 1', completed: false };
    cloneInstance(original, { completed: true });

    expect(original.completed).toBe(false);
  });

  it('should return a different object reference', () => {
    const original = { name: 'Task 1' };
    const clone = cloneInstance(original, {});

    expect(clone).not.toBe(original);
  });

  it('should preserve the prototype of the original object', () => {
    class TaskModel {
      name = '';
      completed = false;

      isComplete() {
        return this.completed;
      }
    }

    const original = new TaskModel();
    original.name = 'Task 1';
    original.completed = false;

    const clone = cloneInstance(original, { completed: true });

    expect(clone).toBeInstanceOf(TaskModel);
    expect(clone.isComplete()).toBe(true);
    expect(clone.name).toBe('Task 1');
  });

  it('should override multiple properties', () => {
    const original = { a: 1, b: 2, c: 3 };
    const clone = cloneInstance(original, { a: 10, c: 30 });

    expect(clone).toEqual({ a: 10, b: 2, c: 30 });
  });
});

describe('createInstance', () => {
  it('should create an instance of the given class with the provided data', () => {
    class Task {
      name = '';
      completed = false;
    }

    const instance = createInstance(Task, { name: 'My Task', completed: true });

    expect(instance).toBeInstanceOf(Task);
    expect(instance.name).toBe('My Task');
    expect(instance.completed).toBe(true);
  });

  it('should use default values for unspecified properties', () => {
    class Task {
      name = 'default';
      completed = false;
      priority = 0;
    }

    const instance = createInstance(Task, { name: 'Custom' });

    expect(instance.name).toBe('Custom');
    expect(instance.completed).toBe(false);
    expect(instance.priority).toBe(0);
  });

  it('should create an instance with empty data using class defaults', () => {
    class Task {
      name = 'untitled';
      completed = false;
    }

    const instance = createInstance(Task, {});

    expect(instance).toBeInstanceOf(Task);
    expect(instance.name).toBe('untitled');
    expect(instance.completed).toBe(false);
  });

  it('should allow methods from the class prototype', () => {
    class Counter {
      count = 0;

      increment() {
        this.count++;
      }
    }

    const instance = createInstance(Counter, { count: 5 });

    expect(instance.count).toBe(5);
    instance.increment();
    expect(instance.count).toBe(6);
  });
});
