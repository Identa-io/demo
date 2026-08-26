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
  /** The ManifestSubject this slot is about; absent = the recipient. */
  subject?: string;
  /**
   * The slot's cardinality (slot-cardinality): false/absent — the default — means ONE standing
   * grant, and a fill with a different resource replaces it; true means grants accrue. Gate any
   * "add another" affordance on this.
   */
  multiple?: boolean;
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

export interface StatusSubject {
  id: string;
  relation: string;
  label?: string;
  repeat: boolean;
}

export interface StatusResponse {
  state: string;
  groups?: StatusGroup[];
  /** The people this manifest asks about beyond the recipient — the cast. */
  subjects?: StatusSubject[];
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
  accept: 'json',
): Promise<T>;
async function partnerGet(
  demo: DemoSlug,
  ds: DemoSession,
  path: string,
  accept: 'raw',
): Promise<Response>;
async function partnerGet<T>(
  demo: DemoSlug,
  ds: DemoSession,
  path: string,
  accept: 'json' | 'raw',
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

/** Streams file content (Vagn's desk view) — the browser never holds a Geena token, so the
 * demo proxies the authenticated download. */
export function getSlotFile(
  demo: DemoSlug,
  ds: DemoSession,
  requestId: string,
  slotId: string,
  fileId: string,
) {
  return partnerGet(demo, ds, `/requests/${requestId}/slots/${slotId}/files/${fileId}`, 'raw');
}

/**
 * One resource that could back a slot. Document rows carry their current `data` when the
 * user's key context can open them (fill-surface bound 2 as amended 2026-08-14) — that is what
 * lets the picker show WHICH email and prefill singleton forms; undecryptable rows, files and
 * ID documents are metadata only.
 */
export interface CandidateItem {
  resourceId: string;
  type: 'document' | 'id_document' | 'file';
  name?: string;
  label?: string;
  fileName?: string;
  data?: Record<string, unknown>;
  version?: number;
  createdAt: string;
  granted: boolean;
}

export interface CandidatesResponse {
  slotId: string;
  kind: string;
  target?: string;
  candidates: CandidateItem[];
}

export interface SubjectPersonCandidate {
  alias: string;
  label: string;
  bound: boolean;
}

export interface SubjectCandidatesResponse {
  subjectId: string;
  relation: string;
  label?: string;
  persons: SubjectPersonCandidate[];
}

async function partnerSend<T>(
  demo: DemoSlug,
  ds: DemoSession,
  method: string,
  path: string,
  body: BodyInit,
  contentType?: string,
): Promise<T> {
  const call = async () => {
    const tokens = await liveTokens(demo, ds);
    const headers: Record<string, string> = { authorization: `Bearer ${tokens.accessToken}` };
    if (contentType) headers['content-type'] = contentType;
    const started = Date.now();
    const res = await fetch(`${geenaApiUrl()}/partner/v1${path}`, {
      method,
      headers,
      body,
      cache: 'no-store',
    });
    logCall(ds, {
      at: started,
      method,
      path: `/partner/v1${path}`,
      status: res.status,
      ms: Date.now() - started,
    });
    return res;
  };

  let res = await call();
  // Same eager-refresh retry as partnerGet: an access token can outlive our clock but not the
  // server's (VM clock drift, sleep/resume). Without this, every write button fails its first
  // press inside the stale window — and "succeeds on the second click" only because the data
  // poll healed the token in between. FormData/string bodies re-serialize safely on the retry.
  if (res.status === 401 && ds.tokens) {
    ds.tokens.expiresAt = 0;
    res = await call();
  }
  const payload = (await res.json().catch(() => ({}))) as T & { message?: string };
  if (!res.ok) {
    throw new Error(payload.message || `partner API ${path} refused (${res.status})`);
  }
  return payload;
}

const personQuery = (person?: string) => (person ? `?person=${encodeURIComponent(person)}` : '');

/** The fill surface: enumerate, pick, create — every act user-present and receipted. */
export function getSlotCandidates(
  demo: DemoSlug,
  ds: DemoSession,
  requestId: string,
  slotId: string,
  person?: string,
) {
  return partnerGet<CandidatesResponse>(
    demo,
    ds,
    `/requests/${requestId}/slots/${slotId}/candidates${personQuery(person)}`,
    'json',
  );
}

export function attachSlot(
  demo: DemoSlug,
  ds: DemoSession,
  requestId: string,
  slotId: string,
  resourceId: string,
  person?: string,
) {
  return partnerSend(
    demo,
    ds,
    'POST',
    `/requests/${requestId}/slots/${slotId}/attach`,
    JSON.stringify(person ? { resourceId, person } : { resourceId }),
    'application/json',
  );
}

export function createSlotDocument(
  demo: DemoSlug,
  ds: DemoSession,
  requestId: string,
  slotId: string,
  data: Record<string, unknown>,
  person?: string,
) {
  return partnerSend(
    demo,
    ds,
    'POST',
    `/requests/${requestId}/slots/${slotId}${personQuery(person)}`,
    JSON.stringify({ data }),
    'application/json',
  );
}

export function uploadSlotFile(
  demo: DemoSlug,
  ds: DemoSession,
  requestId: string,
  slotId: string,
  form: FormData,
) {
  return partnerSend(demo, ds, 'POST', `/requests/${requestId}/slots/${slotId}`, form);
}

/** The person half (subjects-fill-v2): who could answer a subject, and adding someone new. */
export function getSubjectCandidates(
  demo: DemoSlug,
  ds: DemoSession,
  requestId: string,
  subjectId: string,
) {
  return partnerGet<SubjectCandidatesResponse>(
    demo,
    ds,
    `/requests/${requestId}/subjects/${encodeURIComponent(subjectId)}/candidates`,
    'json',
  );
}

export function createSubjectPerson(
  demo: DemoSlug,
  ds: DemoSession,
  requestId: string,
  subjectId: string,
  label: string,
) {
  return partnerSend<{ alias: string; label: string }>(
    demo,
    ds,
    'POST',
    `/requests/${requestId}/subjects/${encodeURIComponent(subjectId)}/persons`,
    JSON.stringify({ label }),
    'application/json',
  );
}

/** Delegated write (`edit` verb): a new version of the slot's granted document. */
export function writeSlotDocument(
  demo: DemoSlug,
  ds: DemoSession,
  requestId: string,
  slotId: string,
  data: Record<string, unknown>,
) {
  return partnerSend(
    demo,
    ds,
    'PUT',
    `/requests/${requestId}/slots/${slotId}`,
    JSON.stringify({ data }),
    'application/json',
  );
}
