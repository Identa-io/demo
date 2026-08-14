import { NextRequest, NextResponse } from 'next/server';
import { isDemoSlug } from '@/lib/demos';
import { createSlotDocument } from '@/lib/geena/partner';
import { demoSession, getSession } from '@/lib/session';

/** Create-and-grant in one act: the value lands in the vault the slot is about. */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    demo?: string;
    slotId?: string;
    data?: Record<string, unknown>;
    person?: string;
  };
  if (!isDemoSlug(body.demo) || !body.slotId || !body.data) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const { session } = await getSession();
  const ds = demoSession(session, body.demo);
  if (!ds.tokens || !ds.requestId) {
    return NextResponse.json({ error: 'not connected' }, { status: 401 });
  }
  try {
    const out = await createSlotDocument(
      body.demo,
      ds,
      ds.requestId,
      body.slotId,
      body.data,
      body.person,
    );
    return NextResponse.json(out);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'create failed' },
      { status: 400 },
    );
  }
}
