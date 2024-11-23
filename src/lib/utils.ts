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
