import { createHash, randomBytes } from 'node:crypto';
import type { DemoSlug } from '../demos';
import { demoCredentials, geenaApiUrl } from '../env';
import { logCall, type DemoSession, type TokenSet } from '../session';

/**
 * The Connect-with-Geena ceremony, server side. This is the whole integration:
 *
 *   1. buildAuthorize() — send the browser to Geena with client id, exact redirect_uri, `state`,
 *      a PKCE S256 challenge, and the manifest id (the "Use Geena" button IS the request).
 *   2. Geena runs the hosted ceremony on ITS origin (sign-in or sign-up, one consent screen);
 *      accepting mints the connection and returns the browser with a single-use code.
 *   3. exchangeCode() — server-to-server, client-authenticated, presenting the PKCE verifier.
 *      The response carries the tokens AND the `request_id` of the connection.
 *
 * Rules this file models on purpose (copy them):
 *  - the client secret and every token live server-side only;
 *  - `state` is checked on every callback and the PKCE verifier never leaves the server;
 *  - token refresh is single-flight per session — Geena's rotation is strict single-use and
 *    REUSE REVOKES THE WHOLE FAMILY, so two parallel refreshes log the user out.
 */

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  request_id?: string;
}

export function makePkce(): { verifier: string; challenge: string; state: string } {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const state = randomBytes(16).toString('base64url');
  return { verifier, challenge, state };
}

export function buildAuthorizeUrl(args: {
  demo: DemoSlug;
  redirectUri: string;
  state: string;
  challenge: string;
}): string {
  const { clientId, manifestId } = demoCredentials(args.demo);
  const url = new URL(`${geenaApiUrl()}/oauth/authorize`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', args.redirectUri);
  url.searchParams.set('state', args.state);
  url.searchParams.set('code_challenge', args.challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('manifest_id', manifestId);
  return url.toString();
}

async function tokenRequest(
  demo: DemoSlug,
  ds: DemoSession,
  note: string,
  params: Record<string, string>,
): Promise<TokenResponse> {
  const { clientId, clientSecret } = demoCredentials(demo);
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, ...params });
  const started = Date.now();
  const res = await fetch(`${geenaApiUrl()}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  logCall(ds, {
    at: started,
    method: 'POST',
    path: '/oauth/token',
    status: res.status,
    ms: Date.now() - started,
    note,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`token endpoint refused (${res.status}): ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as TokenResponse;
}

function toTokenSet(t: TokenResponse): TokenSet {
  return {
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    // Refresh a minute early rather than racing the expiry on a live request.
    expiresAt: Date.now() + Math.max(0, t.expires_in - 60) * 1000,
  };
}

export async function exchangeCode(
  demo: DemoSlug,
  ds: DemoSession,
  args: { code: string; verifier: string; redirectUri: string },
): Promise<{ tokens: TokenSet; requestId?: string }> {
  const t = await tokenRequest(demo, ds, 'code exchange', {
    grant_type: 'authorization_code',
    code: args.code,
    code_verifier: args.verifier,
    redirect_uri: args.redirectUri,
  });
  return { tokens: toTokenSet(t), requestId: t.request_id };
}

/**
 * Returns a live access token, refreshing when needed. Single-flight: concurrent callers await
 * the same refresh promise instead of each spending the (single-use) refresh token.
 */
export async function liveTokens(demo: DemoSlug, ds: DemoSession): Promise<TokenSet> {
  const current = ds.tokens;
  if (!current) throw new Error('not connected');
  if (Date.now() < current.expiresAt) return current;
  if (!ds.refreshing) {
    ds.refreshing = tokenRequest(demo, ds, 'refresh (rotating, single-use)', {
      grant_type: 'refresh_token',
      refresh_token: current.refreshToken,
    })
      .then((t) => {
        const next = toTokenSet(t);
        ds.tokens = next;
        return next;
      })
      .finally(() => {
        delete ds.refreshing;
      });
  }
  return ds.refreshing;
}

/**
 * RFC 7009 revocation: presenting one refresh token tears the whole connection down — consent
 * grant, partner sessions, refresh families. "Disconnect" in a demo means exactly this.
 */
export async function revokeConnection(demo: DemoSlug, ds: DemoSession): Promise<void> {
  const tokens = ds.tokens;
  if (!tokens) return;
  const { clientId, clientSecret } = demoCredentials(demo);
  const started = Date.now();
  const res = await fetch(`${geenaApiUrl()}/oauth/revoke`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      token: tokens.refreshToken,
    }),
    cache: 'no-store',
  });
  logCall(ds, {
    at: started,
    method: 'POST',
    path: '/oauth/revoke',
    status: res.status,
    ms: Date.now() - started,
    note: 'tear down the connection',
  });
}
