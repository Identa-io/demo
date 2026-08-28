import { NextRequest, NextResponse } from 'next/server';
import { isDemoSlug } from '@/lib/demos';
import { demoSession, getSession } from '@/lib/session';
import yieldManifest from '../../../../manifests/yield.json';
import signalio from '../../../../manifests/signalio.json';
import cover from '../../../../manifests/cover.json';

const MANIFESTS = { yield: yieldManifest, signalio, cover } as const;

/**
 * The backstage drawer's data: the manifest this demo opens, the live connection ids, and the
 * session's upstream API log. The demos sell the UX; this sells the integration — every call the
 * coordinator made, with status and latency, is on the record.
 */
export async function GET(request: NextRequest) {
  const demo = request.nextUrl.searchParams.get('demo');
  if (!isDemoSlug(demo)) {
    return NextResponse.json({ error: 'unknown demo' }, { status: 400 });
  }
  const { session } = await getSession();
  const ds = demoSession(session, demo);
  return NextResponse.json({
    demo,
    manifest: MANIFESTS[demo],
    manifestId: process.env[`${demo.toUpperCase()}_MANIFEST_ID`] ?? null,
    clientId: process.env[`${demo.toUpperCase()}_CLIENT_ID`] ?? `${demo}-demo`,
    requestId: ds.requestId ?? null,
    connected: !!ds.tokens,
    log: ds.log,
  });
}
