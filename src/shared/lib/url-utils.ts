/**
 * URL utilities for managing search parameters and browser history
 */

/**
 * Safely gets URL search parameters (returns empty object on server-side)
 */
export function getSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
}

/**
 * Gets a specific search parameter value
 */
export function getSearchParam(key: string): string | null {
  return getSearchParams().get(key);
}

/**
 * Updates URL search parameters without reloading the page
 * @param updates - Object with key-value pairs to update. Use null/undefined to remove a parameter
 */
export function updateSearchParams(updates: Record<string, string | null | undefined>) {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  
  // Apply updates
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });

  // Update URL without reloading the page
  window.history.replaceState({}, '', url.toString());
}

/**
 * Validates if a value is one of the allowed enum values
 */
export function validateEnumValue<T extends Record<string, string>>(
  value: string | null,
  enumObject: T,
  defaultValue: T[keyof T]
): T[keyof T] {
  if (!value) return defaultValue;
  
  const validValues = Object.values(enumObject);
  return validValues.includes(value as T[keyof T]) ? (value as T[keyof T]) : defaultValue;
}