'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DataSlot } from '@/app/api/data/route';
import type { CandidateItem, CandidatesResponse } from '@/lib/geena/partner';
import type { DemoSlug } from './demos';
import { LABEL_OPTIONS, SCHEMA_FIELDS, SINGLETON_TARGETS } from './schema-fields';

/**
 * One form, one act (all three demos): manages an application's recipient slots as ordinary
 * controlled inputs and pushes EVERYTHING on a single submit — no per-data-point buttons.
 *
 * The multi-instance rule (journey UX decision, 2026-08-28):
 *  - no vault candidates      → plain inputs; submit creates with the target's DEFAULT label
 *  - candidates exist         → the first is proposed for reuse (chips to switch or start new);
 *                               editing a proposed value flips the slot to "new" — you are
 *                               drafting a new vault item, with a label of its own
 * Singletons (one value per person) are always a plain prefilled form — set writes in place.
 *
 * Submit per slot:
 *  - granted + edited            → delegated-write update (the org reads the new version)
 *  - granted + untouched         → nothing
 *  - pending, candidate selected → attach as-is
 *  - pending singleton           → set
 *  - pending, "new"              → create with the chosen (or default) label
 *
 * The per-slot receipts still happen server-side, one per slot — only the choreography is gone.
 */

export const NEW_ITEM = 'new';

interface SlotMeta {
  /** Baseline for change detection: served data (granted) or the selected candidate's data. */
  baseline: Record<string, string>;
  candidates: CandidateItem[];
  granted: boolean;
}

async function post(path: string, body: Record<string, unknown>) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? 'the vault write failed — try again');
  }
}

function pickFields(target: string, data: Record<string, unknown> | undefined) {
  const out: Record<string, string> = {};
  for (const field of SCHEMA_FIELDS[target] ?? []) {
    const value = data?.[field.key];
    out[field.key] = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  }
  return out;
}

/** Sensible starting points for a blank draft — never applied over vault data. */
function withDefaults(target: string, data: Record<string, string>) {
  const out = { ...data };
  if (target === 'PersonBankAccount' && !out.currency) out.currency = 'EUR';
  if (target === 'PersonIdentityDocument' && !out.documentType) out.documentType = 'Passport';
  return out;
}

export function defaultLabel(target: string): string {
  return LABEL_OPTIONS[target]?.[0] ?? 'Personal';
}

export function useBulkFill(demo: DemoSlug, slots: DataSlot[] | undefined) {
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  /** Pending multi-instance slots: NEW_ITEM or the resourceId of the candidate to reuse. */
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const meta = useRef<Record<string, SlotMeta>>({});
  const initialized = useRef<Set<string>>(new Set());
  const fetching = useRef<Set<string>>(new Set());

  // Recipient schema slots only — subject slots (the kids) and file slots have their own flows.
  const fillable = (slots ?? []).filter(
    (slot) => slot.target && SCHEMA_FIELDS[slot.target] && !slot.subject,
  );

  // Initialize each slot exactly once (the data poll must never clobber typing in progress).
  useEffect(() => {
    for (const slot of fillable) {
      if (initialized.current.has(slot.slotId) || fetching.current.has(slot.slotId)) continue;
      const target = slot.target!;
      const record = slot.records.find((r) => r.type === 'document' && !r.subject);

      if (slot.status === 'granted' || record) {
        initialized.current.add(slot.slotId);
        const data = pickFields(target, record?.data);
        meta.current[slot.slotId] = { baseline: data, candidates: [], granted: true };
        setValues((prev) => (prev[slot.slotId] ? prev : { ...prev, [slot.slotId]: data }));
        continue;
      }

      fetching.current.add(slot.slotId);
      void (async () => {
        let candidates: CandidateItem[] = [];
        try {
          const res = await fetch(`/api/fill/candidates?demo=${demo}&slot=${slot.slotId}`, {
            cache: 'no-store',
          });
          if (res.ok) {
            const body = (await res.json()) as CandidatesResponse;
            candidates = (body.candidates ?? []).filter((c) => c.type === 'document' && c.data);
          }
        } catch {
          /* start from an empty draft */
        }
        const first = candidates[0];
        const data = first ? pickFields(target, first.data) : withDefaults(target, {});
        meta.current[slot.slotId] = { baseline: data, candidates, granted: false };
        fetching.current.delete(slot.slotId);
        initialized.current.add(slot.slotId);
        setValues((prev) => (prev[slot.slotId] ? prev : { ...prev, [slot.slotId]: data }));
        setSelection((prev) => ({
          ...prev,
          [slot.slotId]: first ? first.resourceId : NEW_ITEM,
        }));
        setLabels((prev) => ({ ...prev, [slot.slotId]: defaultLabel(target) }));
      })();
    }
    // fillable derives from `slots`; the initialized/fetching guards make this idempotent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, demo]);

  const isChanged = useCallback(
    (slotId: string) => {
      const base = meta.current[slotId]?.baseline ?? {};
      const current = values[slotId] ?? {};
      const keys = new Set([...Object.keys(base), ...Object.keys(current)]);
      for (const key of keys) {
        if ((base[key] ?? '') !== (current[key] ?? '')) return true;
      }
      return false;
    },
    [values],
  );

  /** Typing into a proposed vault item means drafting a NEW one — flip the selection. */
  const setField = useCallback((slotId: string, key: string, value: string) => {
    setValues((prev) => ({ ...prev, [slotId]: { ...prev[slotId], [key]: value } }));
    setSelection((prev) =>
      prev[slotId] && prev[slotId] !== NEW_ITEM && !meta.current[slotId]?.granted
        ? { ...prev, [slotId]: NEW_ITEM }
        : prev,
    );
  }, []);

  const selectCandidate = useCallback((slot: DataSlot, resourceId: string) => {
    const candidate = meta.current[slot.slotId]?.candidates.find(
      (c) => c.resourceId === resourceId,
    );
    if (!candidate) return;
    const data = pickFields(slot.target!, candidate.data);
    meta.current[slot.slotId] = { ...meta.current[slot.slotId], baseline: data };
    setValues((prev) => ({ ...prev, [slot.slotId]: data }));
    setSelection((prev) => ({ ...prev, [slot.slotId]: resourceId }));
  }, []);

  const selectNew = useCallback((slot: DataSlot) => {
    const data = withDefaults(slot.target!, {});
    meta.current[slot.slotId] = { ...meta.current[slot.slotId], baseline: data };
    setValues((prev) => ({ ...prev, [slot.slotId]: data }));
    setSelection((prev) => ({ ...prev, [slot.slotId]: NEW_ITEM }));
  }, []);

  const setLabel = useCallback((slotId: string, label: string) => {
    setLabels((prev) => ({ ...prev, [slotId]: label }));
  }, []);

  const slotReady = useCallback(
    (slot: DataSlot) => initialized.current.has(slot.slotId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values],
  );

  const slotComplete = useCallback(
    (slot: DataSlot) => {
      const current = values[slot.slotId] ?? {};
      return (SCHEMA_FIELDS[slot.target!] ?? []).every(
        (field) => (current[field.key] ?? '') !== '',
      );
    },
    [values],
  );

  const candidatesFor = useCallback(
    (slotId: string) => meta.current[slotId]?.candidates ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values],
  );

  /** Pushes every slot in one pass. Returns true when everything landed. */
  const submitAll = useCallback(async (): Promise<boolean> => {
    setBusy(true);
    setErrors({});
    const failures: Record<string, string> = {};
    for (const slot of fillable) {
      const target = slot.target!;
      const slotMeta = meta.current[slot.slotId];
      const chosen = selection[slot.slotId] ?? NEW_ITEM;
      const data = Object.fromEntries(
        Object.entries(values[slot.slotId] ?? {}).filter(([, v]) => v !== ''),
      );
      try {
        if (slotMeta?.granted) {
          if (isChanged(slot.slotId)) {
            await post('/api/fill/update', { demo, slotId: slot.slotId, data });
          }
        } else if (SINGLETON_TARGETS.has(target)) {
          const first = slotMeta?.candidates[0];
          if (first && !isChanged(slot.slotId)) {
            await post('/api/fill/attach', {
              demo,
              slotId: slot.slotId,
              resourceId: first.resourceId,
            });
          } else {
            await post('/api/fill/set', { demo, slotId: slot.slotId, data });
          }
        } else if (chosen !== NEW_ITEM) {
          await post('/api/fill/attach', { demo, slotId: slot.slotId, resourceId: chosen });
        } else {
          await post('/api/fill/create', {
            demo,
            slotId: slot.slotId,
            data,
            name: (labels[slot.slotId] ?? '').trim() || defaultLabel(target),
          });
        }
      } catch (error) {
        failures[slot.slotId] = error instanceof Error ? error.message : 'failed';
      }
    }
    setErrors(failures);
    setBusy(false);
    return Object.keys(failures).length === 0;
  }, [demo, fillable, values, selection, labels, isChanged]);

  return {
    values,
    selection,
    labels,
    setField,
    setLabel,
    selectCandidate,
    selectNew,
    candidatesFor,
    submitAll,
    busy,
    errors,
    slotReady,
    slotComplete,
  };
}

export type BulkFillForm = ReturnType<typeof useBulkFill>;
