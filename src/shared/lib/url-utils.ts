export function getSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
}


export function updateSearchParams(updates: Record<string, string | null | undefined>) {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });

  window.history.replaceState({}, '', url.toString());
}

export function validateEnumValue<T extends Record<string, string>>(
  value: string | null,
  enumObject: T,
  defaultValue: T[keyof T]
): T[keyof T] {
  if (!value) return defaultValue;

  const validValues = Object.values(enumObject);
  return validValues.includes(value as T[keyof T]) ? (value as T[keyof T]) : defaultValue;
}
