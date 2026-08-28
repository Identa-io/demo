/**
 * The journey's three fictional brands, each its own OAuth app + published manifest in the Geena
 * test environment. One persona, three chapters, in order: fill once (Yield), reuse with zero
 * typing (Signalio), then the new shapes — family subjects and a file (Cover). Everything
 * demo-specific hangs off this registry; adding a chapter means one entry here, one route group,
 * one manifest, three env vars.
 */

export type DemoSlug = 'yield' | 'signalio' | 'cover';

export interface DemoDefinition {
  slug: DemoSlug;
  name: string;
  /** 1-based position in the journey — the chapters read in this order. */
  chapter: number;
  /** One line for the journey card: what the scenario is. */
  scenario: string;
  /** One line for the journey card: which Geena capability this chapter proves. */
  proves: string;
  /** The ask, generalized to a phrase — the full manifest lives in the demo's backstage. */
  asks: string;
  /** The single thing to notice in this chapter — shown in the journey bar. */
  watchFor: string;
  /** Short capability tags for the journey card. */
  tags: string[];
  /** Where the connect ceremony returns the visitor inside the demo (the form stage). */
  returnPath: string;
}

export const DEMOS: Record<DemoSlug, DemoDefinition> = {
  yield: {
    slug: 'yield',
    name: 'Yield',
    chapter: 1,
    scenario: 'Open an account at a fund platform — the heaviest onboarding of your life, once.',
    proves:
      'KYC-grade data typed into YOUR vault, not their form: fill in place, update in place, and the organization always reads the current version.',
    asks: 'identity, ID document, payout account and tax residency',
    watchFor: 'You type everything — once, into your vault.',
    tags: ['KYC data', 'fill & edit in place'],
    returnPath: '/apply',
  },
  signalio: {
    slug: 'signalio',
    name: 'Signalio',
    chapter: 2,
    scenario: 'Subscribe to market research — one consent screen, a running subscription.',
    proves:
      'Everything a subscription needs is already in your vault: name, email, billing address, SEPA account. Zero typing — and the small ask is the point.',
    asks: 'name, email, billing address and a SEPA account',
    watchFor: 'You will not type anything.',
    tags: ['zero typing', 'data minimization'],
    returnPath: '/checkout',
  },
  cover: {
    slug: 'cover',
    name: 'Cover',
    chapter: 3,
    scenario: 'Insure the family trip — you flow in, the kids are the only thing new.',
    proves:
      'Family data without "child 1 / child 2" forms — per-person pricing over exactly the children you chose — plus a file slot: upload your current policy, Cover beats it.',
    asks: 'you (prefilled), the children you choose, and one optional file',
    watchFor: 'Your details flow in — only the kids are new.',
    tags: ['family subjects', 'file slots', 'per-person pricing'],
    returnPath: '/quote',
  },
};

export const DEMO_SLUGS = Object.keys(DEMOS) as DemoSlug[];

/** Chapter order for the journey — DEMO_SLUGS sorted by chapter, in one place. */
export const JOURNEY: DemoSlug[] = [...DEMO_SLUGS].sort(
  (a, b) => DEMOS[a].chapter - DEMOS[b].chapter,
);

export function nextChapter(demo: DemoSlug): DemoSlug | undefined {
  return JOURNEY[JOURNEY.indexOf(demo) + 1];
}

/** The hub-origin cookie carrying finished chapters (comma-joined slugs) — see middleware.ts. */
export const PROGRESS_COOKIE = 'gj_done';

export function isDemoSlug(value: string | null | undefined): value is DemoSlug {
  return !!value && value in DEMOS;
}

/**
 * The demos run in two modes with identical code paths:
 *  - subdomain mode (production shape): yield.demo.test.geena.eu — the middleware rewrites
 *    `/apply` to `/yield/apply`, so in-page links need no prefix;
 *  - path mode (plain localhost): everything under one origin, links need the `/yield` prefix.
 * basePath() answers "what prefix do links need for this request's host".
 */
export function demoBasePath(host: string | null, demo: DemoSlug): string {
  const sub = (host ?? '').split(':')[0].split('.')[0];
  return sub === demo ? '' : `/${demo}`;
}

/**
 * The browser-facing origin, derived from what the proxy forwarded — never from
 * `request.nextUrl.origin`, which in the standalone container is the BIND address
 * (https://0.0.0.0:3000) and would leak into redirect URIs. Forwarded headers first,
 * plain Host next (Caddy passes it through), the caller's fallback last.
 */
export function externalOrigin(headers: Headers, fallback: string): string {
  const host = headers.get('x-forwarded-host')?.split(',')[0]?.trim() || headers.get('host');
  if (!host) return fallback;
  const bare = host.split(':')[0];
  const local = bare === 'localhost' || bare.endsWith('.localhost') || bare === '127.0.0.1';
  const proto =
    headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || (local ? 'http' : 'https');
  return `${proto}://${host}`;
}
