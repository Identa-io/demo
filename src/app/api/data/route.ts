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
  /** Single (false/absent) or several — decides whether the filler offers "add another". */
  multiple?: boolean;
  kind: string;
  target?: string;
  status: 'granted' | 'pending';
  records: ServedRecord[];
}

export interface DataResponse {
  configured: boolean;
  configureHint?: string;
  connected: boolean;
  state?: string;
  requestId?: string;
  /** Deep link to the person's own grant screen on the Geena dashboard. */
  grantUrl?: string;
  groups?: StatusGroup[];
  subjects?: StatusSubject[];
  slots?: DataSlot[];
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

  const { session } = await getSession();
  const ds = demoSession(session, demo);

  if (!ds.tokens || !ds.requestId) {
    const body: DataResponse = { configured: true, connected: false };
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
        multiple: item.multiple,
        // The partner plane serves domain kinds in lowercase (`personal_files`); the demo's
        // components compare against the manifest-template casing (`PERSONAL_FILES`), so
        // normalize once here at the boundary.
        kind: item.kind.toUpperCase(),
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
      accessEnded: status.state !== 'active' && status.state !== 'pending',
    };
    return NextResponse.json(body);
  } catch {
    // Serving refused mid-connection: revoked, expired, or the request is gone. Honest state,
    // not a 500 — revocation ending access IS the epilogue working as designed.
    const body: DataResponse = {
      configured: true,
      connected: true,
      requestId: ds.requestId,
      accessEnded: true,
    };
    return NextResponse.json(body);
  }
}
