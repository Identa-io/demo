import { NextRequest, NextResponse } from 'next/server';
import { demoSession, getSession } from '@/lib/session';

/** Records an application against a listing — demo state only, kept in the session. */
export async function POST(request: NextRequest) {
  const { listingId } = (await request.json().catch(() => ({}))) as { listingId?: string };
  if (!listingId) {
    return NextResponse.json({ error: 'listingId required' }, { status: 400 });
  }
  const { session } = await getSession();
  const ds = demoSession(session, 'nyckel');
  if (!ds.tokens) {
    return NextResponse.json({ error: 'not connected' }, { status: 401 });
  }
  if (!ds.applications.includes(listingId)) {
    ds.applications.push(listingId);
  }
  return NextResponse.json({ ok: true, applications: ds.applications });
}
