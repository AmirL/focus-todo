/**
 * Safari browser and PWA detection utilities
 * Used for applying Safari-specific fixes for dialog popover issues
 */

// Type declarations for Safari-specific properties
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface WindowWithSafari extends Window {
  safari?: unknown;
}

/**
 * Detects if the current browser is Safari
 */
export function isSafari(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Safari user agent
  const userAgent = window.navigator.userAgent;
  const isSafariUA = /^((?!chrome|android).)*safari/i.test(userAgent);
  
  // Additional check for Safari-specific features
  const hasSafariFeatures = Boolean((window as WindowWithSafari).safari) || 
    Boolean(window.navigator.vendor?.includes('Apple'));
  
  return isSafariUA || hasSafariFeatures;
}

/**
 * Detects if the app is running in Safari PWA (standalone) mode
 */
export function isSafariPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  const navigator = window.navigator as NavigatorWithStandalone;
  return isSafari() && Boolean(navigator.standalone);
}

/**
 * Detects if the current environment has Safari dialog focus issues
 * This includes both Safari desktop and PWA modes
 */
export function hasSafariDialogIssues(): boolean {
  return isSafari() || isSafariPWA();
}

/**
 * Detects if the current browser is on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
}

/**
 * Combined check for Safari mobile (iPhone/iPad)
 */
export function isSafariMobile(): boolean {
  return isSafari() && isMobileDevice();
}