import { NextRequest, NextResponse } from 'next/server';
import { isDemoSlug } from '@/lib/demos';
import { createSubjectPerson } from '@/lib/geena/partner';
import { demoSession, getSession } from '@/lib/session';

/** The "add kid" act: relation from the subject, label typed by the user, alias returned. */
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
    const out = await createSubjectPerson(
      body.demo,
      ds,
      ds.requestId,
      body.subjectId,
      body.label.trim(),
    );
    return NextResponse.json(out);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'could not add the person' },
      { status: 400 },
    );
  }
}
