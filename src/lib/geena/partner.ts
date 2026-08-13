import type { DemoSlug } from '../demos';
import { geenaApiUrl } from '../env';
import { logCall, type DemoSession } from '../session';
import { liveTokens } from './oauth';

/**
 * The partner consumption plane (`/partner/v1`), read side. Everything here is bounded by what
 * the person granted: `status` says granted-or-pending per slot (pending is indistinguishable
 * from refused and from "no such data" — the oracle rule), and slot reads return the CURRENT
 * version of the granted resource, so data edited in Geena arrives fresh on the next poll.
 * Every serve writes a receipt on the person's side.
 */

export interface StatusVerification {
  method: string;
  level: string;
  verifiedAt: string;
  version: number;
}

export interface StatusItem {
  slotId: string;
  label?: string;
  group?: string;
  kind: string;
  target?: string;
  verbs: string[];
  status: 'granted' | 'pending';
  verification?: StatusVerification[];
}

export interface StatusGroup {
  id: string;
  label: string;
  order: number;
}

export interface StatusResponse {
  state: string;
  groups?: StatusGroup[];
  items: StatusItem[];
}

/** One decrypted record. `document` carries `data`; `file` carries metadata + a download route;
 * records answering a subject slot carry a `subject` block with the pairwise alias. */
export interface ServedRecord {
  resourceId: string;
  type: 'document' | 'id_document' | 'file';
  version?: number;
  name?: string;
  data?: Record<string, unknown>;
  label?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  downloadUrl?: string;
  subject?: { subjectId: string; relation: string; label?: string; alias: string };
}

export interface SlotResponse {
  slotId: string;
  label?: string;
  group?: string;
  kind: string;
  target?: string;
  records?: ServedRecord[];
}

async function partnerGet<T>(
  demo: DemoSlug,
  ds: DemoSession,
  path: string,
  accept: 'json'
): Promise<T>;
async function partnerGet(
  demo: DemoSlug,
  ds: DemoSession,
  path: string,
  accept: 'raw'
): Promise<Response>;
async function partnerGet<T>(
  demo: DemoSlug,
  ds: DemoSession,
  path: string,
  accept: 'json' | 'raw'
): Promise<T | Response> {
  const call = async () => {
    const tokens = await liveTokens(demo, ds);
    const started = Date.now();
    const res = await fetch(`${geenaApiUrl()}/partner/v1${path}`, {
      headers: { authorization: `Bearer ${tokens.accessToken}` },
      cache: 'no-store',
    });
    logCall(ds, {
      at: started,
      method: 'GET',
      path: `/partner/v1${path}`,
      status: res.status,
      ms: Date.now() - started,
    });
    return res;
  };

  let res = await call();
  // One retry after an eager refresh: an access token can outlive our clock but not the
  // server's. Anything else (403/404/410) is a real answer — surface it, don't loop.
  if (res.status === 401 && ds.tokens) {
    ds.tokens.expiresAt = 0;
    res = await call();
  }
  if (accept === 'raw') return res;
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`partner API ${path} refused (${res.status}): ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export function getStatus(demo: DemoSlug, ds: DemoSession, requestId: string) {
  return partnerGet<StatusResponse>(demo, ds, `/requests/${requestId}/status`, 'json');
}

export function getSlot(demo: DemoSlug, ds: DemoSession, requestId: string, slotId: string) {
  return partnerGet<SlotResponse>(demo, ds, `/requests/${requestId}/slots/${slotId}`, 'json');
}

/** Streams file content (Nyckel's landlord view) — the browser never holds a Geena token, so
 * the demo proxies the authenticated download. */
export function getSlotFile(
  demo: DemoSlug,
  ds: DemoSession,
  requestId: string,
  slotId: string,
  fileId: string
) {
  return partnerGet(demo, ds, `/requests/${requestId}/slots/${slotId}/files/${fileId}`, 'raw');
}
