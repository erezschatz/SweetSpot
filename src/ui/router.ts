import { useEffect, useState } from 'preact/hooks';
import { href, parseRoute, type Route } from '../lib/route';

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

/** replace: after saving a form, so Back goes to the list rather than to the form again. */
export function navigate(route: Route, { replace = false } = {}): void {
  if (replace) location.replace(href(route));
  else location.hash = href(route);
}

// The screen she was on just before this one, so leaving can step back to it instead of
// stacking a second copy in history (Android's Back would then show it twice). Compared
// as routes, not raw hashes: the app opens with an empty hash, which is the list.
// Empty after a reload, when the fallback below applies.
let previousHash: string | null = null;
window.addEventListener('hashchange', (e) => {
  previousHash = new URL(e.oldURL).hash;
});

function cameFrom(route: Route): boolean {
  return previousHash !== null && href(parseRoute(previousHash)) === href(route);
}

/**
 * Leaves the current screen for `route`. Back in history if she came from there;
 * otherwise `replace` drops the current entry (a form, which Back must not reopen)
 * and `push` keeps it (an order, which Back may return to).
 */
export function returnTo(route: Route, otherwise: 'replace' | 'push' = 'replace'): void {
  if (cameFrom(route)) history.back();
  else navigate(route, { replace: otherwise === 'replace' });
}
