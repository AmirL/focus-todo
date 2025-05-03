import { clsx, type ClassValue } from 'clsx';
import dayjs from 'dayjs';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isFutureDate(date: Date | null | undefined) {
  if (!date) return false;
  return dayjs(date).isAfter(dayjs().endOf('day'));
}

export function isToday(date: Date | null | undefined) {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), 'day');
}

export const TaskDateKeys = ['completedAt', 'date', 'selectedAt', 'deletedAt', 'updatedAt'] as const;

export function parseDateFields<T extends Record<string, unknown>, K extends keyof T>(obj: T, fields: readonly K[]): T {
  const parsed = { ...obj };

  for (const key of fields) {
    const value = parsed[key];
    if (value) parsed[key] = new Date(value as string) as T[K];
  }

  return parsed;
}
