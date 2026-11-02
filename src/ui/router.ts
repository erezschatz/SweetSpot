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
