'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DataSlot } from '@/app/api/data/route';
import type { StatusSubject, SubjectPersonCandidate } from '@/lib/geena/partner';
import { DEMOS, type DemoSlug } from '@/lib/demos';
import { SlotFiller } from './slot-filler';

/**
 * The person half of the fill surface, in-app: who answers a subject ("each child you cover"),
 * and adding someone new — the "add kid" act. Picking or adding a person doesn't share anything
 * by itself: the per-slot fills below the pick are the consented acts, one by one. The label the
 * user types stays theirs — Geena never serves it on any org-facing surface.
 */
export function FamilyManager({
  demo,
  subject,
  slots,
  onChanged,
}: {
  demo: DemoSlug;
  subject: StatusSubject;
  slots: DataSlot[];
  onChanged: () => void;
}) {
  const [persons, setPersons] = useState<SubjectPersonCandidate[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(
      `/api/subjects/candidates?demo=${demo}&subject=${encodeURIComponent(subject.id)}`,
      {
        cache: 'no-store',
      },
    );
    const body = (await res.json()) as { persons?: SubjectPersonCandidate[]; error?: string };
    if (!res.ok) {
      setError(body.error ?? 'Could not list your family members.');
      setPersons([]);
      return;
    }
    setPersons(body.persons ?? []);
  }, [demo, subject.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const addPerson = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/subjects/person', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ demo, subjectId: subject.id, label: label.trim() }),
      });
      const body = (await res.json()) as { alias?: string; error?: string };
      if (!res.ok || !body.alias) {
        setError(body.error ?? 'Could not add them — try again.');
        return;
      }
      setLabel('');
      setAdding(false);
      await load();
      setSelected(body.alias);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="flex flex-wrap items-center gap-2">
        {persons === null ? (
          <span className="text-[12px] text-[color:var(--muted)]">Checking your family…</span>
        ) : (
          persons.map((person) => (
            <button
              key={person.alias}
              onClick={() => setSelected(selected === person.alias ? null : person.alias)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                selected === person.alias
                  ? 'border-[color:var(--accent)] text-[color:var(--accent)]'
                  : 'border-[color:var(--line)] hover:border-[color:var(--muted)]'
              }`}
            >
              {person.label}
              {person.bound && <span className="ml-1.5 text-[10px] opacity-70">✓ covered</span>}
            </button>
          ))
        )}
        <button
          onClick={() => setAdding((v) => !v)}
          className="rounded-full border border-dashed border-[color:var(--accent)]/60 px-3 py-1.5 text-[12px] font-semibold text-[color:var(--accent)]"
        >
          + Add a child
        </button>
      </div>

      {adding && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Their name — stays in your Geena"
            className="min-w-52 rounded-lg border border-[color:var(--line)] px-3 py-1.5 text-[12.5px]"
            aria-label="The child's name"
          />
          <button
            onClick={() => void addPerson()}
            disabled={busy || !label.trim()}
            className="btn-primary !px-3 !py-1.5 !text-[12px]"
          >
            {busy ? 'Adding…' : 'Add'}
          </button>
          <p className="w-full text-[10px] leading-relaxed text-[color:var(--muted)]">
            This creates their own vault under your account. The name is your label for it —
            {` ${DEMOS[demo].name} `}is never sent it; it only ever sees a pairwise reference.
          </p>
        </div>
      )}

      {selected && (
        <div className="mt-4 space-y-2.5">
          <p className="field-label">
            Share about {persons?.find((p) => p.alias === selected)?.label ?? 'them'}
          </p>
          {slots.map((slot) => (
            <div key={slot.slotId} className="flex flex-wrap items-center gap-2">
              <span className="w-40 text-[12px] text-[color:var(--muted)]">
                {slot.label ?? slot.target}
              </span>
              <SlotFiller demo={demo} slot={slot} person={selected} onFilled={onChanged} />
            </div>
          ))}
          <p className="text-[10px] leading-relaxed text-[color:var(--muted)]">
            Each share is its own consented act — receipted in your Geena, revocable as one.
          </p>
        </div>
      )}

      {error && <p className="mt-2 text-[11px] text-red-700">{error}</p>}
    </div>
  );
}
