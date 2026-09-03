import { useSyncExternalStore } from 'react';

/**
 * `true` at >= 48em (768px) — i.e. at or above `theme.breakpoints[0]`.
 *
 * Most responsive work in this app should use theme-ui's array `sx` values
 * (`px: [5, 10]`, `minHeight: ['touch', 'control']`) rather than this hook.
 * Reach for `useIsDesktop()` only when mobile needs a genuinely *different DOM
 * tree* — the manage page's access log, for example, is a `<table>` on desktop
 * and a stack of cards on mobile, which CSS alone cannot reconcile.
 *
 * There is no SSR in this app, so there is no hydration mismatch to guard
 * against; the server snapshot below exists only to satisfy React's signature.
 */
const QUERY = '(min-width: 48em)';

function getMediaQueryList(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(QUERY);
}

function subscribe(onStoreChange: () => void): () => void {
  const mql = getMediaQueryList();
  if (!mql) return () => {};
  mql.addEventListener('change', onStoreChange);
  return () => mql.removeEventListener('change', onStoreChange);
}

function getSnapshot(): boolean {
  return getMediaQueryList()?.matches ?? true;
}

function getServerSnapshot(): boolean {
  return true;
}

export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useIsDesktop;
