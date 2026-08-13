import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { vagnSessionSecret } from './env';

/**
 * Vagn's own session — the demo APP's session, not Geena's. There is no password behind it:
 * completing the Geena hop is the login, and this cookie is simply "that already happened here".
 * Logging out deletes it (and the locally stored tokens) while the Geena-side connection stays
 * intact — session control belongs to the app, data control belongs to the person.
 */

const COOKIE = 'vagn_session';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sign(payload: string): string {
  return createHmac('sha256', vagnSessionSecret()).update(payload).digest('base64url');
}

export async function issueVagnSession(sid: string): Promise<void> {
  const payload = `${sid}.${Date.now() + TTL_MS}`;
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TTL_MS / 1000,
  });
}

export async function verifyVagnSession(sid: string): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return false;
  const lastDot = raw.lastIndexOf('.');
  if (lastDot < 0) return false;
  const payload = raw.slice(0, lastDot);
  const mac = raw.slice(lastDot + 1);
  const expected = sign(payload);
  if (mac.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false;
  const [cookieSid, exp] = payload.split('.');
  return cookieSid === sid && Number(exp) > Date.now();
}

export async function clearVagnSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
