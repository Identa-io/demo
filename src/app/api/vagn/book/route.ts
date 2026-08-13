import { NextRequest, NextResponse } from 'next/server';
import { demoSession, getSession } from '@/lib/session';

/** Records a reservation against a car class — demo state only, kept in the session. */
export async function POST(request: NextRequest) {
  const { carId } = (await request.json().catch(() => ({}))) as { carId?: string };
  if (!carId) {
    return NextResponse.json({ error: 'carId required' }, { status: 400 });
  }
  const { session } = await getSession();
  const ds = demoSession(session, 'vagn');
  if (!ds.tokens) {
    return NextResponse.json({ error: 'not connected' }, { status: 401 });
  }
  if (!ds.bookings.includes(carId)) {
    ds.bookings.push(carId);
  }
  return NextResponse.json({ ok: true, bookings: ds.bookings });
}
