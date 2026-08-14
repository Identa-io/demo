import { NextRequest, NextResponse } from 'next/server';
import { DEMOS, externalOrigin, isDemoSlug } from '@/lib/demos';
import { buildAuthorizeUrl, makePkce } from '@/lib/geena/oauth';
import { demoSession, getSession } from '@/lib/session';

/**
 * Step 1 of the ceremony: mint `state` + the PKCE verifier (both stay server-side, keyed to the
 * session) and send the browser to Geena. The redirect_uri is this demo's own origin — it must
 * exactly match an origin registered in the app's allowedOrigins.
 */
export async function GET(request: NextRequest) {
  const demo = request.nextUrl.searchParams.get('demo');
  if (!isDemoSlug(demo)) {
    return NextResponse.json({ error: 'unknown demo' }, { status: 400 });
  }

  const { session } = await getSession();
  const ds = demoSession(session, demo);

  const returnTo = request.nextUrl.searchParams.get('return') || DEMOS[demo].returnPath;
  const origin = externalOrigin(request.headers, request.nextUrl.origin);
  const redirectUri = `${origin}/api/auth/callback`;
  const { verifier, challenge, state } = makePkce();
  ds.pending = { state, verifier, redirectUri, returnTo };

  try {
    return NextResponse.redirect(buildAuthorizeUrl({ demo, redirectUri, state, challenge }));
  } catch (error) {
    // Missing credentials — the repo runs, but this demo is not set up yet (see .env.example).
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'demo not configured' },
      { status: 503 },
    );
  }
}
