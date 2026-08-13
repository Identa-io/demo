import type { DemoSlug } from './demos';

/**
 * Runtime configuration. Per demo: the OAuth client credentials and the published manifest id.
 * Only the client secrets (and Vagn's session secret) are secrets — manifest ids travel in
 * browser-visible authorize URLs, and the client id is the app's public slug.
 */

export function geenaApiUrl(): string {
  return (process.env.GEENA_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
}

export function geenaDashboardUrl(): string {
  return (process.env.GEENA_DASHBOARD_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export interface DemoCredentials {
  clientId: string;
  clientSecret: string;
  manifestId: string;
}

const ENV_PREFIX: Record<DemoSlug, string> = {
  vinst: 'VINST',
  resa: 'RESA',
  vagn: 'VAGN',
};

export function demoCredentials(demo: DemoSlug): DemoCredentials {
  const prefix = ENV_PREFIX[demo];
  const clientId = process.env[`${prefix}_CLIENT_ID`] ?? `${demo}-demo`;
  const clientSecret = process.env[`${prefix}_CLIENT_SECRET`] ?? '';
  const manifestId = process.env[`${prefix}_MANIFEST_ID`] ?? '';
  if (!clientSecret || !manifestId) {
    throw new Error(
      `${demo} is not configured: set ${prefix}_CLIENT_SECRET and ${prefix}_MANIFEST_ID (see .env.example)`,
    );
  }
  return { clientId, clientSecret, manifestId };
}

export function vagnSessionSecret(): string {
  return process.env.VAGN_SESSION_SECRET ?? 'change-me';
}
