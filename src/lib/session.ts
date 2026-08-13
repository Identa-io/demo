import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import type { DemoSlug } from './demos';

/**
 * The coordinator's session store — the ONLY place Geena tokens live. The browser holds an
 * opaque session id in an httpOnly cookie; tokens never reach it.
 *
 * In-memory with a TTL, which is exactly right for a demo and exactly wrong for production:
 * a real partner persists this encrypted and survives restarts. Written as a module-level map on
 * globalThis so Next.js dev-mode module reloads keep the sessions.
 */

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms after which the access token should be refreshed. */
  expiresAt: number;
}

export interface BackstageEntry {
  at: number;
  method: string;
  path: string;
  status: number;
  ms: number;
  note?: string;
}

export interface PendingCeremony {
  state: string;
  verifier: string;
  redirectUri: string;
  /** Where inside the demo the visitor returns after the hop. */
  returnTo: string;
}

export interface DemoSession {
  pending?: PendingCeremony;
  tokens?: TokenSet;
  requestId?: string;
  /** Single-flight token refresh: concurrent requests share one refresh (rotation is strict
   * single-use — a second parallel refresh would revoke the whole family). */
  refreshing?: Promise<TokenSet>;
  /** Vagn only: the car classes the visitor reserved, so the account page has content. */
  bookings: string[];
  /** The backstage drawer's API log — every upstream Geena call this session made. */
  log: BackstageEntry[];
}

interface Session {
  demos: Partial<Record<DemoSlug, DemoSession>>;
  touchedAt: number;
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const COOKIE_NAME = 'gd_sid';
const LOG_LIMIT = 60;

const globalStore = globalThis as unknown as { __geenaDemoSessions?: Map<string, Session> };
const sessions: Map<string, Session> = (globalStore.__geenaDemoSessions ??= new Map());

function sweep() {
  const now = Date.now();
  for (const [sid, session] of sessions) {
    if (now - session.touchedAt > SESSION_TTL_MS) sessions.delete(sid);
  }
}

/** Reads the session for this request, creating one (and setting the cookie) when absent. */
export async function getSession(): Promise<{ sid: string; session: Session }> {
  sweep();
  const jar = await cookies();
  let sid = jar.get(COOKIE_NAME)?.value;
  let session = sid ? sessions.get(sid) : undefined;
  if (!sid || !session) {
    sid = randomBytes(24).toString('base64url');
    session = { demos: {}, touchedAt: Date.now() };
    sessions.set(sid, session);
    // Host-only on purpose: never set Domain= — a domain cookie would flow across every
    // *.demo.test.geena.eu sibling and undo the per-demo origin isolation.
    jar.set(COOKIE_NAME, sid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_TTL_MS / 1000,
    });
  }
  session.touchedAt = Date.now();
  return { sid, session };
}

export function demoSession(
  session: { demos: Partial<Record<DemoSlug, DemoSession>> },
  demo: DemoSlug,
): DemoSession {
  return (session.demos[demo] ??= { bookings: [], log: [] });
}

export function logCall(ds: DemoSession, entry: BackstageEntry) {
  ds.log.push(entry);
  if (ds.log.length > LOG_LIMIT) ds.log.splice(0, ds.log.length - LOG_LIMIT);
}

/** Drops everything Geena-related for one demo (used by logout and revoke). */
export function clearDemoSession(ds: DemoSession) {
  delete ds.pending;
  delete ds.tokens;
  delete ds.requestId;
  delete ds.refreshing;
  ds.bookings = [];
}
