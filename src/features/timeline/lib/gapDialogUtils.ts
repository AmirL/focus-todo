/**
 * Pure utility functions extracted from QuickAddFromGapDialog.
 * Testable without React dependencies.
 */

/** Format an ISO date string to a local HH:mm time input value */
export function formatTimeInput(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** Format a duration in minutes as a human-readable string (e.g. "1h 30m") */
export function formatGapDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Parse a HH:mm time string onto a reference date, returning a new Date */
export function parseTimeToDate(timeStr: string, referenceDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(referenceDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/** Compute the duration in minutes between start and end time strings */
export function computeGapDuration(
  startTime: string,
  endTime: string,
  referenceDate: Date,
): number | null {
  if (!startTime || !endTime) return null;
  const start = parseTimeToDate(startTime, referenceDate);
  const end = parseTimeToDate(endTime, referenceDate);
  const mins = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  return mins > 0 ? mins : null;
}

/** Validate that a gap task submission has all required fields */
export function isValidGapSubmission(
  name: string,
  selectedListId: number | null,
  startTime: string,
  endTime: string,
  referenceDate: Date,
): boolean {
  if (!name.trim() || !selectedListId) return false;
  const start = parseTimeToDate(startTime, referenceDate);
  const end = parseTimeToDate(endTime, referenceDate);
  return end > start;
}

/** Build the payload for creating a completed task from a gap fill */
export function buildGapTaskPayload(
  name: string,
  selectedListId: number,
  startTime: string,
  endTime: string,
  referenceDate: Date,
): { task: { name: string; listId: number }; startedAt: string; endedAt: string } {
  const startDate = parseTimeToDate(startTime, referenceDate);
  const endDate = parseTimeToDate(endTime, referenceDate);
  return {
    task: { name: name.trim(), listId: selectedListId },
    startedAt: startDate.toISOString(),
    endedAt: endDate.toISOString(),
  };
}
