import { NextResponse } from 'next/server';
import { clearVagnSession } from '@/lib/vagn-auth';
import { clearDemoSession, demoSession, getSession } from '@/lib/session';

/**
 * Logout — Vagn's own session ends (cookie + locally held tokens dropped) while the Geena
 * connection stays intact. Logging back in is one hop: with an active connection the ceremony
 * skips consent entirely, so it feels like a login, because it is one.
 */
export async function POST() {
  const { session } = await getSession();
  clearDemoSession(demoSession(session, 'vagn'));
  await clearVagnSession();
  return NextResponse.json({ ok: true });
}
