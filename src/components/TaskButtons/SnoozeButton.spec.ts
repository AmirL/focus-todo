import { snoozeTask } from './SnoozeButton';
import { Task } from '@/data-classes/task';
import dayjs from 'dayjs';

describe('snoozeTask', () => {
  const createTask = (task: Partial<Task>) => {
    return Task.create({ id: '1', ...task });
  };

  it('set starred to false if the new date is after today', () => {
    const task = createTask({ starred: true });
    const newDate = dayjs().add(1, 'day').toDate();
    const result = snoozeTask(task, newDate);
    expect(result.starred).toBe(false);
  });

  it('does not change starred if the new date is today', () => {
    const task = createTask({ starred: true });
    const result = snoozeTask(task, new Date());
    expect(result.starred).toBe(true);
  });

  it('does not change starred if the new date is before today', () => {
    const task = createTask({ starred: true });
    const newDate = dayjs().subtract(1, 'day').toDate();
    const result = snoozeTask(task, newDate);
    expect(result.starred).toBe(true);
  });

  it('set the new date', () => {
    const task = createTask({ date: new Date(), starred: false });
    const newDate = dayjs().add(1, 'day').toDate();
    const result = snoozeTask(task, newDate);
    expect(result.date).toBe(newDate);
  });
});
