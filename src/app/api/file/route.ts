import { NextRequest, NextResponse } from 'next/server';
import { isDemoSlug } from '@/lib/demos';
import { getSlotFile } from '@/lib/geena/partner';
import { demoSession, getSession } from '@/lib/session';

/**
 * Authenticated file proxy: granted file content (Nyckel's salary slips) streams through the
 * coordinator because the Bearer token never reaches the browser. Every byte served here wrote
 * a receipt on the person's side.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const demo = params.get('demo');
  const slotId = params.get('slot');
  const fileId = params.get('file');
  if (!isDemoSlug(demo) || !slotId || !fileId) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  const { session } = await getSession();
  const ds = demoSession(session, demo);
  if (!ds.tokens || !ds.requestId) {
    return NextResponse.json({ error: 'not connected' }, { status: 401 });
  }

  const upstream = await getSlotFile(demo, ds, ds.requestId, slotId, fileId);
  if (!upstream.ok) {
    return NextResponse.json({ error: 'unavailable' }, { status: upstream.status });
  }
  return new NextResponse(upstream.body, {
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/octet-stream',
      'content-disposition': upstream.headers.get('content-disposition') ?? 'inline',
      'cache-control': 'no-store',
    },
  });
}
