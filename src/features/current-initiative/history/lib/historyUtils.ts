import dayjs from 'dayjs';

export function formatHistoryDate(dateValue: string | Date): string {
  const date = dayjs(dateValue);
  const today = dayjs();
  const yesterday = today.subtract(1, 'day');

  if (date.isSame(today, 'day')) {
    return 'Today';
  }
  if (date.isSame(yesterday, 'day')) {
    return 'Yesterday';
  }
  return date.format('MMM D');
}
