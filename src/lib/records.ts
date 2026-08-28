import type { DataSlot } from '@/app/api/data/route';
import type { ServedRecord } from './geena/partner';

/**
 * Rendering helpers over served slots. The demos never guess slot ids (they are minted at
 * publish) — slots are found by their schema target, and values come from the CURRENT served
 * version.
 */

export function slotByTarget(slots: DataSlot[] | undefined, target: string): DataSlot | undefined {
  return slots?.find((slot) => slot.target === target);
}

export function slotByKind(slots: DataSlot[] | undefined, kind: string): DataSlot | undefined {
  return slots?.find((slot) => slot.kind === kind);
}

/** First served document data for a target — the recipient's own record (no subject block). */
export function docData(
  slots: DataSlot[] | undefined,
  target: string,
): Record<string, unknown> | undefined {
  const slot = slotByTarget(slots, target);
  const record = slot?.records.find((r) => r.type === 'document' && !r.subject);
  return record?.data;
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function fullName(data: Record<string, unknown> | undefined): string {
  if (!data) return '';
  const parts = [str(data.firstName), str(data.middleName), str(data.lastName)].filter(Boolean);
  return parts.join(' ') || str(data.preferredName);
}

export function addressLines(data: Record<string, unknown> | undefined): string[] {
  if (!data) return [];
  return [
    [str(data.streetAddress), str(data.streetAddressLine2)].filter(Boolean).join(', '),
    [str(data.postalCode), str(data.city)].filter(Boolean).join(' '),
    [str(data.addressRegion), str(data.addressCountry)].filter(Boolean).join(', '),
  ].filter(Boolean);
}

/** "…4417" — enough to recognise an account, never the whole number on screen. */
export function maskedAccount(data: Record<string, unknown> | undefined): string {
  const number = str(data?.accountNumber);
  if (!number) return '';
  const bank = str(data?.bankName);
  const tail = number.replace(/\s/g, '').slice(-4);
  return [bank, `···· ${tail}`].filter(Boolean).join(' ');
}

/** "WEBER/ANNA" — a name set the way boarding passes have always set them (Cover's ticket). */
export function passengerCode(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].toUpperCase();
  const last = parts[parts.length - 1];
  return `${last}/${parts.slice(0, -1).join(' ')}`.toUpperCase();
}

/** "Passport ···· 417 · DE" — a review screen needs recognition, never the whole number. */
export function maskedDocument(data: Record<string, unknown> | undefined): string {
  const number = str(data?.documentNumber);
  if (!number) return '';
  const type = str(data?.documentType) || 'Document';
  const country = str(data?.issuingCountry);
  const tail = number.replace(/\s/g, '').slice(-3);
  return [`${type} ···· ${tail}`, country].filter(Boolean).join(' · ');
}

export function taxResidency(data: Record<string, unknown> | undefined): string {
  const country = str(data?.taxResidenceCountry);
  const id = str(data?.taxID);
  if (!country && !id) return '';
  const maskedId = id ? `TIN ····${id.replace(/\s/g, '').slice(-3)}` : '';
  return [country, maskedId].filter(Boolean).join(' · ');
}

/**
 * One line of a candidate's current value for the picker row — recognition, not exposure:
 * account numbers render masked, everything else shows what a person needs to tell their
 * items apart ("which email is this?").
 */
export function candidateSummary(
  target: string | undefined,
  data: Record<string, unknown> | undefined,
): string {
  if (!data) return '';
  switch (target) {
    case 'PersonEmail':
      return str(data.email);
    case 'PersonPhone':
      return str(data.telephone);
    case 'PersonAddress':
      return addressLines(data).join(', ');
    case 'PersonBankAccount':
      return maskedAccount(data);
    case 'PersonIdentityDocument':
      return maskedDocument(data);
    case 'PersonFullName':
      return fullName(data);
    default: {
      const first = Object.values(data).find((v) => typeof v === 'string' && v !== '');
      return typeof first === 'string' ? first : '';
    }
  }
}

/** One family member as the organization sees them: the pairwise alias, never an identity. */
export interface FamilyMemberView {
  alias: string;
  relation: string;
  name: string;
  dateOfBirth: string;
}

/**
 * Groups subject-slot records by person. Each served record about a family member carries a
 * `subject` block — the same alias across slots of one connection, meaningless outside it.
 */
export function familyFromSlots(slots: DataSlot[] | undefined): FamilyMemberView[] {
  const byAlias = new Map<string, FamilyMemberView>();
  const collect = (record: ServedRecord, apply: (p: FamilyMemberView) => void) => {
    if (!record.subject) return;
    const entry = byAlias.get(record.subject.alias) ?? {
      alias: record.subject.alias,
      relation: record.subject.relation,
      name: '',
      dateOfBirth: '',
    };
    apply(entry);
    byAlias.set(record.subject.alias, entry);
  };
  for (const slot of slots ?? []) {
    for (const record of slot.records) {
      if (record.type !== 'document' || !record.data) continue;
      if (slot.target === 'PersonFullName') {
        collect(record, (p) => {
          p.name = fullName(record.data);
        });
      }
      if (slot.target === 'PersonBirthDetails') {
        collect(record, (p) => {
          p.dateOfBirth = str(record.data?.dateOfBirth);
        });
      }
    }
  }
  return [...byAlias.values()];
}

export function ageFrom(dateOfBirth: string): number | null {
  const born = new Date(dateOfBirth);
  if (Number.isNaN(born.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  const beforeBirthday =
    now.getMonth() < born.getMonth() ||
    (now.getMonth() === born.getMonth() && now.getDate() < born.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}
