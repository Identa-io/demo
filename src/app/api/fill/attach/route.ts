import { NextRequest, NextResponse } from 'next/server';
import { isDemoSlug } from '@/lib/demos';
import { attachSlot } from '@/lib/geena/partner';
import { demoSession, getSession } from '@/lib/session';

/** The in-app pick: the user's tap mints the grant, receipted with app provenance. */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    demo?: string;
    slotId?: string;
    resourceId?: string;
    person?: string;
  };
  if (!isDemoSlug(body.demo) || !body.slotId || !body.resourceId) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const { session } = await getSession();
  const ds = demoSession(session, body.demo);
  if (!ds.tokens || !ds.requestId) {
    return NextResponse.json({ error: 'not connected' }, { status: 401 });
  }
  try {
    const out = await attachSlot(
      body.demo,
      ds,
      ds.requestId,
      body.slotId,
      body.resourceId,
      body.person,
    );
    return NextResponse.json(out);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'attach failed' },
      { status: 400 },
    );
  }
}
