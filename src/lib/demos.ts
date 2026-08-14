/**
 * The three fictional brands, each its own OAuth app + published manifest in the Geena test
 * environment. Everything demo-specific hangs off this registry; adding a fourth demo means one
 * entry here, one route group, one manifest, three env vars.
 */

export type DemoSlug = 'vinst' | 'resa' | 'vagn';

export interface DemoDefinition {
  slug: DemoSlug;
  name: string;
  /** One line for the landing card: what the scenario is. */
  scenario: string;
  /** One line for the landing card: which Geena capability it proves. */
  proves: string;
  /** The ask, generalized to a phrase — the full manifest lives in the demo's backstage. */
  asks: string;
  /** Short capability tags for the landing card. */
  tags: string[];
  /** Where the connect ceremony returns the visitor inside the demo. */
  returnPath: string;
}

export const DEMOS: Record<DemoSlug, DemoDefinition> = {
  vinst: {
    slug: 'vinst',
    name: 'Vinst',
    scenario:
      'Run your account at a fund platform — it opens from your vault and updates in place.',
    proves:
      'KYC-grade data that manages itself: fill from the vault, update any value in place, and the organization reads the current version.',
    asks: 'identity, payout account and tax residency',
    tags: ['account management', 'autofill', 'KYC data'],
    returnPath: '/register',
  },
  resa: {
    slug: 'resa',
    name: 'Resa',
    scenario: 'Buy travel insurance for yourself and your children in one sitting.',
    proves:
      'Family data without "child 1 / child 2" forms — you decide which children to cover, the insurer never learns more.',
    asks: 'you, plus exactly the children you choose',
    tags: ['family subjects', 'per-person pricing'],
    returnPath: '/',
  },
  vagn: {
    slug: 'vagn',
    name: 'Vagn',
    scenario: 'Rent a car with a real account — and no password, ever.',
    proves:
      'Geena as the whole login stack, a licence shared without attachments, and a revocation that actually ends access.',
    asks: 'your driver profile and licence',
    tags: ['passwordless login', 'documents', 'revoke'],
    returnPath: '/account',
  },
};

export const DEMO_SLUGS = Object.keys(DEMOS) as DemoSlug[];

export function isDemoSlug(value: string | null | undefined): value is DemoSlug {
  return !!value && value in DEMOS;
}

/**
 * The demos run in two modes with identical code paths:
 *  - subdomain mode (production shape): vinst.demo.test.geena.eu — the middleware rewrites
 *    `/register` to `/vinst/register`, so in-page links need no prefix;
 *  - path mode (plain localhost): everything under one origin, links need the `/vinst` prefix.
 * basePath() answers "what prefix do links need for this request's host".
 */
export function demoBasePath(host: string | null, demo: DemoSlug): string {
  const sub = (host ?? '').split(':')[0].split('.')[0];
  return sub === demo ? '' : `/${demo}`;
}
