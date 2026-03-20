import dayjs from 'dayjs';

export const NEGLECT_THRESHOLD_DAYS = 5;

export function getDaysAgoLabel(lastUsedDate: string | null): string {
  if (!lastUsedDate) {
    return 'never';
  }
  const today = dayjs().startOf('day');
  const lastUsed = dayjs(lastUsedDate).startOf('day');
  const daysSince = today.diff(lastUsed, 'day');

  if (daysSince === 0) {
    return 'today';
  }
  if (daysSince === 1) {
    return '1 day ago';
  }
  return `${daysSince} days ago`;
}

export function calculateDaysSince(lastUsedDate: string | null): number | null {
  if (!lastUsedDate) {
    return null;
  }
  const today = dayjs().startOf('day');
  const lastUsed = dayjs(lastUsedDate).startOf('day');
  return today.diff(lastUsed, 'day');
}
