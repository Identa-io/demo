import { NextRequest, NextResponse } from 'next/server';
import { isDemoSlug } from '@/lib/demos';
import { revokeConnection } from '@/lib/geena/oauth';
import { clearVagnSession } from '@/lib/vagn-auth';
import { clearDemoSession, demoSession, getSession } from '@/lib/session';

/**
 * Disconnect — the app-side revocation (RFC 7009): the whole connection is torn down at Geena,
 * then the local session follows. Distinct from logout, which touches nothing on the Geena side.
 */
export async function POST(request: NextRequest) {
  const demo = request.nextUrl.searchParams.get('demo');
  if (!isDemoSlug(demo)) {
    return NextResponse.json({ error: 'unknown demo' }, { status: 400 });
  }

  const { session } = await getSession();
  const ds = demoSession(session, demo);
  try {
    await revokeConnection(demo, ds);
  } finally {
    clearDemoSession(ds);
    if (demo === 'vagn') await clearVagnSession();
  }
  return NextResponse.json({ ok: true });
}
