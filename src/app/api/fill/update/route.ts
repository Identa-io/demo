import { NextRequest, NextResponse } from 'next/server';
import { isDemoSlug } from '@/lib/demos';
import { getSlot, writeSlotDocument } from '@/lib/geena/partner';
import { demoSession, getSession } from '@/lib/session';

/**
 * Update an already-granted slot: the manage-account path. The submitted fields are written
 * OVER the record's current data (the form shows a subset of the schema and must not clobber
 * the rest) through the delegated-write route — the `edit` verb the person consented to. A
 * no-op submit writes nothing.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    demo?: string;
    slotId?: string;
    data?: Record<string, unknown>;
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
    const slot = await getSlot(body.demo, ds, ds.requestId, body.slotId);
    const record = slot.records?.find((r) => r.type === 'document');
    if (!record) {
      return NextResponse.json({ error: 'nothing granted to update' }, { status: 409 });
    }
    const current = record.data ?? {};
    const next = { ...current, ...body.data };
    if (JSON.stringify(next) === JSON.stringify(current)) {
      return NextResponse.json({ ok: true, unchanged: true });
    }
    const out = await writeSlotDocument(body.demo, ds, ds.requestId, body.slotId, next);
    return NextResponse.json(out);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'could not push the update' },
      { status: 400 },
    );
  }
}
