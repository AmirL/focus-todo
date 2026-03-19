import dayjs from 'dayjs';

export const NEGLECT_THRESHOLD_DAYS = 5;

export function getDaysLabel(daysSinceLastUsed: number | null): string {
  if (daysSinceLastUsed === null) {
    return 'never used';
  }
  if (daysSinceLastUsed === 0) {
    return 'today';
  }
  if (daysSinceLastUsed === 1) {
    return 'yesterday';
  }
  return `${daysSinceLastUsed}d ago`;
}

export function calculateDaysSinceLastUsed(lastUsedDate: string | null): number | null {
  if (!lastUsedDate) {
    return null;
  }
  const today = dayjs().startOf('day');
  const lastUsed = dayjs(lastUsedDate).startOf('day');
  return today.diff(lastUsed, 'day');
}
