import { NextRequest, NextResponse } from 'next/server';
import { isDemoSlug } from '@/lib/demos';
import {
  attachSlot,
  createSlotDocument,
  getSlotCandidates,
  writeSlotDocument,
} from '@/lib/geena/partner';
import { demoSession, getSession } from '@/lib/session';

/**
 * Singleton fill: a person has one legal name, one birth date — picking between instances makes
 * no sense, so "set" means: attach the existing document (usually the empty starter) and write
 * the typed value into it; create only when nothing exists. Both halves are receipted acts under
 * their own verbs (`fill` for the attach, `edit` for the write). Family-member slots fall back
 * to create-and-grant — delegated writes into a relative's vault stay first-party by design.
 */
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
    if (body.person) {
      const out = await createSlotDocument(
        body.demo,
        ds,
        ds.requestId,
        body.slotId,
        body.data,
        body.person,
      );
      return NextResponse.json(out);
    }
    const existing = await getSlotCandidates(body.demo, ds, ds.requestId, body.slotId);
    const first = existing.candidates?.[0];
    if (first) {
      if (!first.granted) {
        await attachSlot(body.demo, ds, ds.requestId, body.slotId, first.resourceId);
      }
      // Write the submitted fields over the document's current data, never instead of it — the
      // form shows a subset of the schema and must not clobber the rest. When nothing actually
      // changed ("Confirm & share" untouched), the attach alone is the act: no version bump.
      const current = first.data ?? {};
      const next = { ...current, ...body.data };
      if (JSON.stringify(next) === JSON.stringify(current)) {
        return NextResponse.json({ ok: true, unchanged: true });
      }
      const out = await writeSlotDocument(body.demo, ds, ds.requestId, body.slotId, next);
      return NextResponse.json(out);
    }
    const out = await createSlotDocument(body.demo, ds, ds.requestId, body.slotId, body.data);
    return NextResponse.json(out);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'could not set the value' },
      { status: 400 },
    );
  }
}
