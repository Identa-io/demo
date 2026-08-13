/**
 * The three fictional brands, each its own OAuth app + published manifest in the Geena test
 * environment. Everything demo-specific hangs off this registry; adding a fourth demo means one
 * entry here, one route group, one manifest, three env vars.
 */

export type DemoSlug = 'blomma' | 'fckomet' | 'nyckel';

export interface DemoDefinition {
  slug: DemoSlug;
  name: string;
  /** One sentence for the landing card: what the scenario is. */
  scenario: string;
  /** One sentence for the landing card: which Geena capability it proves. */
  proves: string;
  /** Where the connect ceremony returns the visitor inside the demo. */
  returnPath: string;
}

export const DEMOS: Record<DemoSlug, DemoDefinition> = {
  blomma: {
    slug: 'blomma',
    name: 'Blomma',
    scenario: 'A flower shop with no accounts — pick a bouquet, check out.',
    proves: 'Zero-typing autofill: your details arrive from your vault and stay current.',
    returnPath: '/checkout',
  },
  fckomet: {
    slug: 'fckomet',
    name: 'FC Komet',
    scenario: 'Register your children for the football season.',
    proves: 'Family data without "child 1 / child 2" forms — you choose who to share.',
    returnPath: '/',
  },
  nyckel: {
    slug: 'nyckel',
    name: 'Nyckel',
    scenario: 'An apartment platform with a real account — and no password, ever.',
    proves: 'Geena as the entire login stack, documents without attachments, revoke that works.',
    returnPath: '/account',
  },
};

export const DEMO_SLUGS = Object.keys(DEMOS) as DemoSlug[];

export function isDemoSlug(value: string | null | undefined): value is DemoSlug {
  return !!value && value in DEMOS;
}

/**
 * The demos run in two modes with identical code paths:
 *  - subdomain mode (production shape): blomma.demo.test.geena.eu — the middleware rewrites
 *    `/checkout` to `/blomma/checkout`, so in-page links need no prefix;
 *  - path mode (plain localhost): everything under one origin, links need the `/blomma` prefix.
 * basePath() answers "what prefix do links need for this request's host".
 */
export function demoBasePath(host: string | null, demo: DemoSlug): string {
  const sub = (host ?? '').split(':')[0].split('.')[0];
  return sub === demo ? '' : `/${demo}`;
}
