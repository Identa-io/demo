import { NextRequest, NextResponse } from 'next/server';
import { DEMO_SLUGS, isDemoSlug, PROGRESS_COOKIE } from './lib/demos';

/**
 * Two jobs, both host-shaped:
 *
 * 1. Host-based routing: each demo is its own origin (yield.demo.test.geena.eu — and
 *    yield.localhost:3005 in dev, which browsers resolve without /etc/hosts). On a demo
 *    subdomain, `/apply` rewrites to `/yield/apply`; on the bare host, the same routes are
 *    reachable path-style (`/yield/apply`), so local development needs nothing special.
 *
 * 2. The journey relay: chapter-finish CTAs route through the HUB (`/?done=yield&next=signalio`)
 *    because progress must live in a hub-origin cookie — the demos are separate origins with
 *    host-only cookies, so no cookie of theirs could carry it. The relay records the finished
 *    chapter and forwards to the next one (or renders the hub, ticks updated).
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const sub = host.split(':')[0].split('.')[0];
  const { pathname, searchParams } = request.nextUrl;

  if ((DEMO_SLUGS as string[]).includes(sub) && !pathname.startsWith(`/${sub}`)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${sub}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // On the hub host only: record chapter completion, then forward.
  const done = searchParams.get('done');
  if (pathname === '/' && isDemoSlug(done)) {
    const seen = (request.cookies.get(PROGRESS_COOKIE)?.value ?? '').split(',').filter(Boolean);
    if (!seen.includes(done)) seen.push(done);

    const next = searchParams.get('next');
    const subdomainMode = host.startsWith('demo.');
    const proto = host.includes('localhost') ? 'http' : 'https';
    const target = isDemoSlug(next)
      ? subdomainMode
        ? `${proto}://${next}.${host}/`
        : `/${next}`
      : '/';

    const response = NextResponse.redirect(new URL(target, request.nextUrl), 303);
    // Host-only on purpose (no Domain=): the hub's cookie, nobody else's.
    response.cookies.set(PROGRESS_COOKIE, seen.join(','), {
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // The coordinator API and Next internals stay un-rewritten on every host.
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};
