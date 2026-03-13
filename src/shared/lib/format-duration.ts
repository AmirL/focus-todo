/** Formats duration in minutes to a concise string like "15m", "1h", "1.5h", "2h 30m", or null if invalid. */
export function formatDuration(minutes: number | null | undefined): string | null {
  if (minutes === null || minutes === undefined || minutes <= 0) {
    return null;
  }
  
  // Special cases for common durations to ensure consistency
  if (minutes === 15) return '15m';
  if (minutes === 30) return '30m';
  if (minutes === 60) return '1h';
  if (minutes === 90) return '1.5h';
  if (minutes === 150) return '2.5h';
  if (minutes === 240) return '4h';
  if (minutes === 480 || minutes === 390) return '1d';

  // Generic formatting for other durations
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
}

/** Formats total duration for display in filter tabs. Returns empty string if zero. */
export function formatTotalDuration(minutes: number): string {
  if (minutes === 0) return '';
  return formatDuration(minutes) || '';
}