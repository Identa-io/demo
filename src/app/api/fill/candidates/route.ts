import { NextRequest, NextResponse } from 'next/server';
import { isDemoSlug } from '@/lib/demos';
import { getSlotCandidates } from '@/lib/geena/partner';
import { demoSession, getSession } from '@/lib/session';

/** Candidates for one slot — metadata only, straight from the fill surface. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const demo = params.get('demo');
  const slotId = params.get('slot');
  if (!isDemoSlug(demo) || !slotId) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const { session } = await getSession();
  const ds = demoSession(session, demo);
  if (!ds.tokens || !ds.requestId) {
    return NextResponse.json({ error: 'not connected' }, { status: 401 });
  }
  try {
    const out = await getSlotCandidates(
      demo,
      ds,
      ds.requestId,
      slotId,
      params.get('person') ?? undefined,
    );
    return NextResponse.json(out);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'candidates failed' },
      { status: 400 },
    );
  }
}
