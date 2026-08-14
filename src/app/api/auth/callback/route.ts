import { NextRequest, NextResponse } from 'next/server';
import { DEMO_SLUGS, demoBasePath, externalOrigin, type DemoSlug } from '@/lib/demos';
import { exchangeCode } from '@/lib/geena/oauth';
import { issueVagnSession } from '@/lib/vagn-auth';
import { demoSession, getSession } from '@/lib/session';

/**
 * Step 3 of the ceremony: the browser lands back with `code` + `state`. The state must match a
 * ceremony THIS session started (checked before anything is spent), the code is exchanged
 * server-to-server with the PKCE verifier, and the response hands over the tokens AND the
 * `request_id` of the connection — no out-of-band request discovery needed.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const state = params.get('state') ?? '';
  const { sid, session } = await getSession();

  // Which demo does this callback belong to? The one whose pending ceremony carries this state.
  let demo: DemoSlug | undefined;
  for (const slug of DEMO_SLUGS) {
    if (session.demos[slug]?.pending?.state === state) {
      demo = slug;
      break;
    }
  }
  const origin = externalOrigin(request.headers, request.nextUrl.origin);
  if (!demo || !state) {
    return NextResponse.redirect(`${origin}/?error=state`);
  }

  const ds = demoSession(session, demo);
  const pending = ds.pending!;
  delete ds.pending;
  const base = `${origin}${demoBasePath(request.headers.get('host'), demo)}`;

  // The person said no (or the ceremony refused). Render it as an answer, not an error page.
  if (params.get('error')) {
    return NextResponse.redirect(`${base}${pending.returnTo}?denied=1`);
  }

  const code = params.get('code');
  if (!code) {
    return NextResponse.redirect(`${base}${pending.returnTo}?denied=1`);
  }

  try {
    const { tokens, requestId } = await exchangeCode(demo, ds, {
      code,
      verifier: pending.verifier,
      redirectUri: pending.redirectUri,
    });
    ds.tokens = tokens;
    if (requestId) ds.requestId = requestId;
    if (demo === 'vagn') await issueVagnSession(sid);
    return NextResponse.redirect(`${base}${pending.returnTo}?connected=1`);
  } catch {
    return NextResponse.redirect(`${base}${pending.returnTo}?failed=1`);
  }
}
