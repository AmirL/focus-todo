interface WindowWithSafari extends Window {
  safari?: unknown;
}

export function isSafari(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent;
  const isSafariUA = /^((?!chrome|android).)*safari/i.test(userAgent);

  const hasSafariFeatures = Boolean((window as WindowWithSafari).safari) ||
    Boolean(window.navigator.vendor?.includes('Apple'));

  return isSafariUA || hasSafariFeatures;
}

