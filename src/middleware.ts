import { NextRequest, NextResponse } from 'next/server';
import { DEMO_SLUGS } from './lib/demos';

/**
 * Host-based routing: each demo is its own origin (vinst.demo.test.geena.eu — and
 * vinst.localhost:3005 in dev, which browsers resolve without /etc/hosts). On a demo
 * subdomain, `/register` rewrites to `/vinst/register`; on the bare host, the same routes are
 * reachable path-style (`/vinst/register`), so local development needs nothing special.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const sub = host.split(':')[0].split('.')[0];
  const { pathname } = request.nextUrl;

  if ((DEMO_SLUGS as string[]).includes(sub) && !pathname.startsWith(`/${sub}`)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${sub}${pathname}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  // The coordinator API and Next internals stay un-rewritten on every host.
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};
