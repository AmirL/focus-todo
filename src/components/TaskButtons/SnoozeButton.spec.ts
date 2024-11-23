import { snoozeTask } from './SnoozeButton';
import { Task } from '@/classes/task';
import dayjs from 'dayjs';

describe('snoozeTask', () => {
  const createTask = ({ date, selected }: { date: Date; selected: boolean }) => {
    return Object.assign(new Task(), { id: '1', date: date.toISOString(), selected });
  };

  it('set selected to false if the new date is after today', () => {
    const task = createTask({ date: new Date(), selected: true });
    const newDate = dayjs().add(1, 'day').toDate();
    const result = snoozeTask(task, newDate);
    expect(result.selected).toBe(false);
  });

  it('does not change selected if the new date is today', () => {
    const task = createTask({ date: new Date(), selected: true });
    const result = snoozeTask(task, new Date());
    expect(result.selected).toBe(true);
  });

  it('does not change selected if the new date is before today', () => {
    const task = createTask({ date: new Date(), selected: true });
    const newDate = dayjs().subtract(1, 'day').toDate();
    const result = snoozeTask(task, newDate);
    expect(result.selected).toBe(true);
  });

  it('set the new date', () => {
    const task = createTask({ date: new Date(), selected: false });
    const newDate = dayjs().add(1, 'day').toDate();
    const result = snoozeTask(task, newDate);
    expect(result.date).toBe(newDate.toISOString());
  });
});
