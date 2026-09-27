import { NextRequest, NextResponse } from 'next/server';
import { isDemoSlug } from '@/lib/demos';
import { createSubjectParticipant } from '@/lib/geena/partner';
import { demoSession, getSession } from '@/lib/session';

/**
 * The "add" act on a subject — for Cover, "add a child": the relation comes from the subject's
 * declaration, the label from what the user typed, and the response is the pairwise alias the
 * per-slot fills then name as `participant`.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    demo?: string;
    subjectId?: string;
    label?: string;
  };
  if (!isDemoSlug(body.demo) || !body.subjectId || !body.label?.trim()) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const { session } = await getSession();
  const ds = demoSession(session, body.demo);
  if (!ds.tokens || !ds.requestId) {
    return NextResponse.json({ error: 'not connected' }, { status: 401 });
  }
  try {
    const out = await createSubjectParticipant(
      body.demo,
      ds,
      ds.requestId,
      body.subjectId,
      body.label.trim(),
    );
    return NextResponse.json(out);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'could not add them' },
      { status: 400 },
    );
  }
}
