interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

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

export function isSafariPWA(): boolean {
  if (typeof window === 'undefined') return false;

  const navigator = window.navigator as NavigatorWithStandalone;
  return isSafari() && Boolean(navigator.standalone);
}

/** Equivalent to isSafari() since isSafariPWA() is a subset of isSafari(). */
export function hasSafariDialogIssues(): boolean {
  return isSafari();
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
}

export function isSafariMobile(): boolean {
  return isSafari() && isMobileDevice();
}
