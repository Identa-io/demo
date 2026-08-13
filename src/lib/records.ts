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
  target: string
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

/** One family member as FC Komet sees them: the pairwise alias, never a vault id. */
export interface PlayerView {
  alias: string;
  relation: string;
  name: string;
  dateOfBirth: string;
}

/**
 * Groups subject-slot records by person. Each served record about a family member carries a
 * `subject` block — same alias across slots of one connection, meaningless outside it.
 */
export function playersFromSlots(slots: DataSlot[] | undefined): PlayerView[] {
  const byAlias = new Map<string, PlayerView>();
  const collect = (record: ServedRecord, apply: (p: PlayerView) => void) => {
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
