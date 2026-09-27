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

/** The lane a subject is answered from: a family-member vault, or a company the user manages. */
export type ParticipantType = 'person' | 'company';

export interface StatusSubject {
  id: string;
  type: ParticipantType;
  /** The declared kinship — present on `person` subjects only; a company has none. */
  relation?: string;
  label?: string;
  repeat: boolean;
}

/**
 * One party actually answering a subject: the pairwise alias — stable across this
 * organization's connections, meaningless anywhere else, never a vault id.
 */
export interface ParticipantRef {
  subjectId: string;
  type: ParticipantType;
  alias: string;
}

export interface StatusResponse {
  state: string;
  groups?: StatusGroup[];
  /** The parties this manifest asks about beyond the recipient — the ask. */
  subjects?: StatusSubject[];
  /** Who is actually cast — derived from the grants; absent while nobody is bound. */
  participants?: ParticipantRef[];
  items: StatusItem[];
}

/**
 * One decrypted record. `document` carries `data`; `file` carries metadata + a download route.
 * EVERY record carries `participant`: `null` for the recipient's own data, or the party a
 * subject slot's record belongs to. A record may instead arrive `status: "unavailable"` with a
 * `reason` and no `type` — read `status` before `type`.
 */
export interface ServedRecord {
  resourceId: string;
  participant?: ParticipantRef | null;
  type?: 'document' | 'id_document' | 'file';
  version?: number;
  name?: string;
  data?: Record<string, unknown>;
  label?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  downloadUrl?: string;
  status?: 'available' | 'unavailable';
  /** `participant_ineligible` (the user no longer speaks for the party) or `record_unreadable`. */
  reason?: string;
}

export interface SlotResponse {
  slotId: string;
  label?: string;
  group?: string;
  /** The ask, as on `/status`; who answered is each record's own `participant`. */
  subject?: string;
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

/** Streams file content (Cover's shared policy) — the browser never holds a Geena token, so the
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

/** Who could answer a subject: a family member, or a company the user manages. */
export interface SubjectParticipantCandidate {
  alias: string;
  /** The user's own label for the party — appears here and on no other partner surface. */
  label: string;
  bound: boolean;
  /** Company candidates only, best-effort: what tells two companies apart in a picker. */
  details?: { registrationCountry?: string; registrationNumber?: string };
}

export interface SubjectCandidatesResponse {
  subjectId: string;
  type: ParticipantType;
  relation?: string;
  label?: string;
  repeat?: boolean;
  participants: SubjectParticipantCandidate[];
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

/**
 * The participant a subject-slot act is for — a pairwise alias from the subject's candidates.
 * Required on subject slots (`422 participant_required`), refused on recipient slots
 * (`422 participant_not_allowed`); the query form, which wins over a body field.
 */
const participantQuery = (participant?: string) =>
  participant ? `?participant=${encodeURIComponent(participant)}` : '';

/** The fill surface: enumerate, pick, create — every act user-present and receipted. */
export function getSlotCandidates(
  demo: DemoSlug,
  ds: DemoSession,
  requestId: string,
  slotId: string,
  participant?: string,
) {
  return partnerGet<CandidatesResponse>(
    demo,
    ds,
    `/requests/${requestId}/slots/${slotId}/candidates${participantQuery(participant)}`,
    'json',
  );
}

export function attachSlot(
  demo: DemoSlug,
  ds: DemoSession,
  requestId: string,
  slotId: string,
  resourceId: string,
  participant?: string,
) {
  return partnerSend(
    demo,
    ds,
    'POST',
    `/requests/${requestId}/slots/${slotId}/attach`,
    JSON.stringify(participant ? { resourceId, participant } : { resourceId }),
    'application/json',
  );
}

export function createSlotDocument(
  demo: DemoSlug,
  ds: DemoSession,
  requestId: string,
  slotId: string,
  data: Record<string, unknown>,
  participant?: string,
) {
  return partnerSend(
    demo,
    ds,
    'POST',
    `/requests/${requestId}/slots/${slotId}${participantQuery(participant)}`,
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

/** The subject half of the fill surface: who could answer a subject, and adding someone new. */
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

/**
 * The "add" act: what is minted follows the subject's type — a family-member vault owned by the
 * user (the relation comes from the manifest, the label from what they typed), or a company
 * the user founds. Not idempotent: single-flight the button.
 */
export function createSubjectParticipant(
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
    `/requests/${requestId}/subjects/${encodeURIComponent(subjectId)}/participants`,
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
