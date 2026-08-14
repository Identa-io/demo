import { NextRequest, NextResponse } from 'next/server';
import { isDemoSlug } from '@/lib/demos';
import { uploadSlotFile } from '@/lib/geena/partner';
import { demoSession, getSession } from '@/lib/session';

/** File create-and-grant (multipart), proxied — the browser never holds a Geena token. */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const demo = form?.get('demo');
  const slotId = form?.get('slotId');
  const file = form?.get('file');
  if (
    !form ||
    typeof demo !== 'string' ||
    !isDemoSlug(demo) ||
    typeof slotId !== 'string' ||
    !(file instanceof File)
  ) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const { session } = await getSession();
  const ds = demoSession(session, demo);
  if (!ds.tokens || !ds.requestId) {
    return NextResponse.json({ error: 'not connected' }, { status: 401 });
  }
  const upstream = new FormData();
  upstream.set('file', file);
  const label = form.get('label');
  if (typeof label === 'string' && label) upstream.set('label', label);
  try {
    const out = await uploadSlotFile(demo, ds, ds.requestId, slotId, upstream);
    return NextResponse.json(out);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'upload failed' },
      { status: 400 },
    );
  }
}
