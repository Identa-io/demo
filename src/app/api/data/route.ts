import { NextRequest, NextResponse } from 'next/server';
import { isDemoSlug } from '@/lib/demos';
import { demoCredentials, geenaDashboardUrl } from '@/lib/env';
import {
  getSlot,
  getStatus,
  type ServedRecord,
  type StatusGroup,
  type StatusSubject,
} from '@/lib/geena/partner';
import { verifyVagnSession } from '@/lib/vagn-auth';
import { demoSession, getSession } from '@/lib/session';

/**
 * The one endpoint every demo page polls. It answers three questions in one shot:
 * am I connected, what did the person grant so far, and what are the values.
 *
 * Granted slots are served fresh on every call — the partner plane returns the CURRENT version
 * of a granted resource, which is why "change your address in Geena, come back here" just works.
 * A revoked connection surfaces as a refusal mid-request; the demos render that as the honest
 * "access ended" state rather than an error page.
 */

export interface DataSlot {
  slotId: string;
  label?: string;
  group?: string;
  /** The manifest subject this slot is about; absent = the recipient. */
  subject?: string;
  kind: string;
  target?: string;
  status: 'granted' | 'pending';
  records: ServedRecord[];
}

export interface DataResponse {
  configured: boolean;
  configureHint?: string;
  connected: boolean;
  vagnAuthed?: boolean;
  state?: string;
  requestId?: string;
  /** Deep link to the person's own grant screen on the Geena dashboard. */
  grantUrl?: string;
  groups?: StatusGroup[];
  subjects?: StatusSubject[];
  slots?: DataSlot[];
  bookings?: string[];
  /** Set when the connection stopped serving (revoked/expired) — the "access ended" state. */
  accessEnded?: boolean;
}

export async function GET(request: NextRequest) {
  const demo = request.nextUrl.searchParams.get('demo');
  if (!isDemoSlug(demo)) {
    return NextResponse.json({ error: 'unknown demo' }, { status: 400 });
  }

  try {
    demoCredentials(demo);
  } catch (error) {
    const body: DataResponse = {
      configured: false,
      configureHint: error instanceof Error ? error.message : 'not configured',
      connected: false,
    };
    return NextResponse.json(body);
  }

  const { sid, session } = await getSession();
  const ds = demoSession(session, demo);
  const vagnAuthed = demo === 'vagn' ? await verifyVagnSession(sid) : undefined;

  if (!ds.tokens || !ds.requestId) {
    const body: DataResponse = { configured: true, connected: false, vagnAuthed };
    return NextResponse.json(body);
  }

  try {
    const status = await getStatus(demo, ds, ds.requestId);

    // Values for what is granted, fetched in parallel; pending slots stay a status word — the
    // org never learns why (pending is indistinguishable from refused, by design).
    const granted = status.items.filter((item) => item.status === 'granted');
    const served = await Promise.all(
      granted.map((item) => getSlot(demo, ds, ds.requestId!, item.slotId).catch(() => undefined)),
    );
    const recordsBySlot = new Map<string, ServedRecord[]>();
    served.forEach((slot) => {
      if (slot) recordsBySlot.set(slot.slotId, slot.records ?? []);
    });

    const body: DataResponse = {
      configured: true,
      connected: true,
      vagnAuthed,
      state: status.state,
      requestId: ds.requestId,
      grantUrl: `${geenaDashboardUrl()}/personal/connections/${ds.requestId}`,
      groups: status.groups ?? [],
      subjects: status.subjects ?? [],
      slots: status.items.map((item) => ({
        slotId: item.slotId,
        label: item.label,
        group: item.group,
        subject: item.subject,
        kind: item.kind,
        target: item.target,
        status: item.status,
        records: (recordsBySlot.get(item.slotId) ?? []).map((record) =>
          record.type === 'file'
            ? {
                ...record,
                // The browser never holds a Geena token — file bytes flow through our proxy.
                downloadUrl: `/api/file?demo=${demo}&slot=${item.slotId}&file=${record.resourceId}`,
              }
            : record,
        ),
      })),
      bookings: demo === 'vagn' ? ds.bookings : undefined,
      accessEnded: status.state !== 'active' && status.state !== 'pending',
    };
    return NextResponse.json(body);
  } catch {
    // Serving refused mid-connection: revoked, expired, or the request is gone. Honest state,
    // not a 500 — this is Vagn's finale working as designed.
    const body: DataResponse = {
      configured: true,
      connected: true,
      vagnAuthed,
      requestId: ds.requestId,
      accessEnded: true,
      bookings: demo === 'vagn' ? ds.bookings : undefined,
    };
    return NextResponse.json(body);
  }
}
