import { describe, it, expect } from 'vitest';
import {
  formatMilestoneDate,
  buildNewGoal,
  buildUpdatedGoal,
  buildDeletedGoal,
  isValidMilestoneDescription,
  buildMilestonePayload,
} from './goalUtils';
import dayjs from 'dayjs';

describe('formatMilestoneDate', () => {
  it('returns "Today" for today\'s date', () => {
    const today = dayjs().toISOString();
    expect(formatMilestoneDate(today)).toBe('Today');
  });

  it('returns "Yesterday" for yesterday\'s date', () => {
    const yesterday = dayjs().subtract(1, 'day').toISOString();
    expect(formatMilestoneDate(yesterday)).toBe('Yesterday');
  });

  it('returns formatted date for older dates', () => {
    const oldDate = '2025-01-15T10:00:00.000Z';
    expect(formatMilestoneDate(oldDate)).toBe('Jan 15, 2025');
  });

  it('returns formatted date for 2 days ago', () => {
    const twoDaysAgo = dayjs().subtract(2, 'day').toISOString();
    const result = formatMilestoneDate(twoDaysAgo);
    expect(result).not.toBe('Today');
    expect(result).not.toBe('Yesterday');
    expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
  });
});

describe('buildNewGoal', () => {
  it('creates a goal with the given properties', () => {
    const goal = buildNewGoal('Learn TypeScript', 'Complete course', 10, 1);
    expect(goal.title).toBe('Learn TypeScript');
    expect(goal.description).toBe('Complete course');
    expect(goal.progress).toBe(10);
    expect(goal.listId).toBe(1);
  });

  it('creates a goal with zero progress', () => {
    const goal = buildNewGoal('New Goal', '', 0, 2);
    expect(goal.progress).toBe(0);
    expect(goal.description).toBe('');
  });
});

describe('buildUpdatedGoal', () => {
  it('updates title, description, and progress', () => {
    const original = buildNewGoal('Old Title', 'Old desc', 10, 1);
    const updated = buildUpdatedGoal(original, 'New Title', 'New desc', 50);
    expect(updated.title).toBe('New Title');
    expect(updated.description).toBe('New desc');
    expect(updated.progress).toBe(50);
    expect(updated.listId).toBe(1); // preserved from original
  });
});

describe('buildDeletedGoal', () => {
  it('sets deletedAt to a recent timestamp', () => {
    const goal = buildNewGoal('Goal', '', 0, 1);
    const deleted = buildDeletedGoal(goal);
    expect(deleted.deletedAt).toBeTruthy();
    const deletedTime = new Date(deleted.deletedAt as string).getTime();
    expect(Date.now() - deletedTime).toBeLessThan(5000);
  });

  it('preserves other goal properties', () => {
    const goal = buildNewGoal('Goal', 'Desc', 30, 2);
    const deleted = buildDeletedGoal(goal);
    expect(deleted.title).toBe('Goal');
    expect(deleted.description).toBe('Desc');
    expect(deleted.progress).toBe(30);
  });
});

describe('isValidMilestoneDescription', () => {
  it('returns true for non-empty description', () => {
    expect(isValidMilestoneDescription('Fixed bug')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isValidMilestoneDescription('')).toBe(false);
  });

  it('returns false for whitespace-only string', () => {
    expect(isValidMilestoneDescription('   ')).toBe(false);
  });
});

describe('buildMilestonePayload', () => {
  it('builds a milestone with trimmed description', () => {
    const payload = buildMilestonePayload('goal-1', 50, '  Fixed the bug  ');
    expect(payload.goalId).toBe('goal-1');
    expect(payload.progress).toBe(50);
    expect(payload.description).toBe('Fixed the bug');
  });
});
