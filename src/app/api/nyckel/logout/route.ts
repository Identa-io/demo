import { NextResponse } from 'next/server';
import { clearNyckelSession } from '@/lib/nyckel-auth';
import { clearDemoSession, demoSession, getSession } from '@/lib/session';

/**
 * Logout — Nyckel's own session ends (cookie + locally held tokens dropped) while the Geena
 * connection stays intact. Logging back in is one hop: with an active connection the ceremony
 * skips consent entirely, so it feels like a login, because it is one.
 */
export async function POST() {
  const { session } = await getSession();
  clearDemoSession(demoSession(session, 'nyckel'));
  await clearNyckelSession();
  return NextResponse.json({ ok: true });
}
