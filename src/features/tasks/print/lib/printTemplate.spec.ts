import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePrintHTML } from './printTemplate';
import type { GroupedTasks } from './printUtils';

describe('generatePrintHTML', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns valid HTML for empty groups', () => {
    const html = generatePrintHTML({}, 0, 0, null);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Daily Tasks');
    expect(html).toContain('Total Tasks: 0');
    expect(html).toContain('Est. Time: 0m');
    expect(html).toContain('15/06/2024');
  });

  it('renders a single group with tasks', () => {
    const grouped: GroupedTasks = {
      Work: [
        { name: 'Task 1', details: null, estimatedDuration: 30, listId: 1 } as never,
        { name: 'Task 2', details: null, estimatedDuration: 60, listId: 1 } as never,
      ],
    };
    const html = generatePrintHTML(grouped, 2, 90, new Date('2024-06-15'));
    expect(html).toContain('<h2>Work</h2>');
    expect(html).toContain('Task 1');
    expect(html).toContain('Task 2');
    expect(html).toContain('30m');
    expect(html).toContain('1h');
    expect(html).toContain('Subtotal: 1.5h');
    expect(html).toContain('Total Tasks: 2');
    expect(html).toContain('Est. Time: 1.5h');
  });

  it('renders multiple groups', () => {
    const grouped: GroupedTasks = {
      Work: [
        { name: 'Work Task', details: null, estimatedDuration: 30, listId: 1 } as never,
      ],
      Personal: [
        { name: 'Personal Task', details: null, estimatedDuration: 15, listId: 2 } as never,
      ],
    };
    const html = generatePrintHTML(grouped, 2, 45, null);
    expect(html).toContain('<h2>Work</h2>');
    expect(html).toContain('<h2>Personal</h2>');
    expect(html).toContain('Work Task');
    expect(html).toContain('Personal Task');
  });

  it('renders task details when present', () => {
    const grouped: GroupedTasks = {
      Work: [
        { name: 'Task With Details', details: 'Some notes here', estimatedDuration: 15, listId: 1 } as never,
      ],
    };
    const html = generatePrintHTML(grouped, 1, 15, null);
    expect(html).toContain('task-details');
    expect(html).toContain('Some notes here');
  });

  it('omits details div when details are empty', () => {
    const grouped: GroupedTasks = {
      Work: [
        { name: 'No Details', details: '', estimatedDuration: 10, listId: 1 } as never,
      ],
    };
    const html = generatePrintHTML(grouped, 1, 10, null);
    // The class "task-details" appears in styles, so check that no details div is rendered for this task
    expect(html).not.toContain('<div class="task-details">');
  });

  it('shows 0m for tasks without duration', () => {
    const grouped: GroupedTasks = {
      Work: [
        { name: 'No Duration', details: null, estimatedDuration: null, listId: 1 } as never,
      ],
    };
    const html = generatePrintHTML(grouped, 1, 0, null);
    expect(html).toContain('0m');
  });

  it('uses firstTaskDate for title and header when provided', () => {
    const html = generatePrintHTML({}, 0, 0, new Date('2024-03-25T00:00:00Z'));
    expect(html).toContain('25/03/2024');
  });

  it('renders additional tasks section with new task lines', () => {
    const html = generatePrintHTML({}, 0, 0, null);
    expect(html).toContain('Additional Tasks');
    expect(html).toContain('new-task-line');
  });
});
