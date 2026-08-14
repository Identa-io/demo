import { NextRequest, NextResponse } from 'next/server';
import { isDemoSlug } from '@/lib/demos';
import { getSubjectCandidates } from '@/lib/geena/partner';
import { demoSession, getSession } from '@/lib/session';

/** Who could answer a subject — relation-scoped, alias-keyed, consented by accept. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const demo = params.get('demo');
  const subjectId = params.get('subject');
  if (!isDemoSlug(demo) || !subjectId) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const { session } = await getSession();
  const ds = demoSession(session, demo);
  if (!ds.tokens || !ds.requestId) {
    return NextResponse.json({ error: 'not connected' }, { status: 401 });
  }
  try {
    const out = await getSubjectCandidates(demo, ds, ds.requestId, subjectId);
    return NextResponse.json(out);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'candidates failed' },
      { status: 400 },
    );
  }
}
