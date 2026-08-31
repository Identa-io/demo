'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEMO_SLUGS, type DemoSlug } from './demos';
import type { DataResponse } from '@/app/api/data/route';

/**
 * The one client-side hook: polls the coordinator's /api/data while the page is open, so grants
 * made on the Geena dashboard appear here without a manual refresh — and a revocation flips the
 * page to its "access ended" state the same way.
 */
export function useGeena(demo: DemoSlug, options?: { pollMs?: number }) {
  const [data, setData] = useState<DataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const pollMs = options?.pollMs ?? 4000;
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/data?demo=${demo}`, { cache: 'no-store' });
      if (!res.ok) return;
      const body = (await res.json()) as DataResponse;
      if (alive.current) setData(body);
    } catch {
      /* transient network errors: keep the last state */
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [demo]);

  useEffect(() => {
    alive.current = true;
    void refresh();
    const timer = setInterval(() => void refresh(), pollMs);
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      alive.current = false;
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh, pollMs]);

  return { data, loading, refresh };
}

/** Link prefix for in-demo navigation: '' on the demo's own subdomain, '/{demo}' in path mode. */
export function useDemoBase(demo: DemoSlug): string {
  const [base, setBase] = useState(`/${demo}`);
  useEffect(() => {
    const sub = window.location.hostname.split('.')[0];
    setBase(sub === demo ? '' : `/${demo}`);
  }, [demo]);
  return base;
}

/**
 * The journey hub's URL from wherever we are: on a demo subdomain the hub is the parent host
 * (yield.demo.test.geena.eu -> demo.test.geena.eu); in path mode it is simply '/'.
 */
export function useHubHref(): string {
  const [href, setHref] = useState('/');
  useEffect(() => {
    const { protocol, host } = window.location;
    const [sub, ...rest] = host.split('.');
    // Only strip a DEMO subdomain — demo.test.geena.eu itself must stay the hub.
    if (rest.length && (DEMO_SLUGS as string[]).includes(sub)) {
      setHref(`${protocol}//${rest.join('.')}/`);
    } else {
      setHref('/');
    }
  }, []);
  return href;
}

/**
 * A chapter-finish CTA: route through the hub so progress lands in the hub-origin cookie
 * (the middleware records `done` and forwards to `next` — or renders the hub, ticks updated).
 */
export function useJourneyAdvanceHref(demo: DemoSlug, next?: DemoSlug): string {
  const hub = useHubHref();
  const params = new URLSearchParams({ done: demo });
  if (next) params.set('next', next);
  return `${hub === '/' ? '' : hub.replace(/\/$/, '')}/?${params.toString()}`;
}

/** The connect hop entry — a plain navigation, the server does the rest. */
export function connectHref(demo: DemoSlug, returnTo?: string): string {
  const params = new URLSearchParams({ demo });
  if (returnTo) params.set('return', returnTo);
  return `/api/auth/start?${params.toString()}`;
}
