'use client';

import { useState } from 'react';
import type { DataSlot } from '@/app/api/data/route';
import type { CandidateItem, CandidatesResponse } from '@/lib/geena/partner';
import type { DemoSlug } from '@/lib/demos';
import { SCHEMA_FIELDS } from '@/lib/schema-fields';

/**
 * The in-app fill control for one pending slot — the whole point of the fill surface: the user
 * never leaves the app for data. Expanding it lists the vault's candidates (metadata only —
 * every listing is receipted on the Geena side); one tap attaches, or an inline form creates the
 * value and grants it in the same call. `person` scopes everything to a family member's vault.
 */
export function SlotFiller({
  demo,
  slot,
  person,
  onFilled,
}: {
  demo: DemoSlug;
  slot: DataSlot;
  person?: string;
  onFilled: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState<CandidateItem[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = slot.target ? (SCHEMA_FIELDS[slot.target] ?? []) : [];
  const isFile = slot.kind === 'PERSONAL_FILES';

  const expand = async () => {
    setOpen(true);
    setError(null);
    const params = new URLSearchParams({ demo, slot: slot.slotId });
    if (person) params.set('person', person);
    const res = await fetch(`/api/fill/candidates?${params}`, { cache: 'no-store' });
    const body = (await res.json()) as CandidatesResponse & { error?: string };
    if (!res.ok) {
      setError(body.error ?? 'Could not list your matching items.');
      setCandidates([]);
      return;
    }
    setCandidates(body.candidates ?? []);
  };

  const run = async (act: () => Promise<Response>) => {
    setBusy(true);
    setError(null);
    try {
      const res = await act();
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? 'That did not work — try again.');
        return;
      }
      setOpen(false);
      setValues({});
      setFile(null);
      onFilled();
    } finally {
      setBusy(false);
    }
  };

  const attach = (resourceId: string) =>
    run(() =>
      fetch('/api/fill/attach', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ demo, slotId: slot.slotId, resourceId, person }),
      }),
    );

  const create = () =>
    run(() =>
      fetch('/api/fill/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          demo,
          slotId: slot.slotId,
          data: Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '')),
          person,
        }),
      }),
    );

  const upload = () =>
    run(() => {
      const form = new FormData();
      form.set('demo', demo);
      form.set('slotId', slot.slotId);
      if (file) form.set('file', file, file.name);
      return fetch('/api/fill/upload', { method: 'POST', body: form });
    });

  if (!open) {
    return (
      <button
        onClick={() => void expand()}
        className="rounded-lg border border-dashed border-[color:var(--accent)]/50 px-3 py-1.5 text-[12px] font-semibold text-[color:var(--accent)] hover:border-[color:var(--accent)]"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        Fill {slot.label ? `“${slot.label}”` : 'this'} here
      </button>
    );
  }

  return (
    <div
      className="rounded-xl border border-[color:var(--line)] bg-[color:var(--card)] p-3.5 text-left"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold">{slot.label ?? slot.target}</p>
        <button
          onClick={() => setOpen(false)}
          className="text-[11px] text-[color:var(--muted)] hover:opacity-70"
        >
          Close
        </button>
      </div>

      {candidates === null ? (
        <p className="mt-2 text-[12px] text-[color:var(--muted)]">Checking your vault…</p>
      ) : candidates.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {candidates.map((candidate) => (
            <li key={candidate.resourceId}>
              <button
                onClick={() => void attach(candidate.resourceId)}
                disabled={busy || candidate.granted}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-[color:var(--line)] px-3 py-2 text-[12.5px] hover:border-[color:var(--accent)] disabled:opacity-50"
              >
                <span className="vault-value truncate">
                  {candidate.name || candidate.label || candidate.fileName || 'Item'}
                </span>
                <span
                  className="shrink-0 text-[10px] font-semibold"
                  style={{ color: 'var(--accent)' }}
                >
                  {candidate.granted ? 'shared' : 'use this'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[12px] text-[color:var(--muted)]">
          Nothing matching in the vault yet.
        </p>
      )}

      <div className="mt-3 border-t border-[color:var(--line)] pt-3">
        <p className="field-label">Add new</p>
        {isFile ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-[12px]"
            />
            <button
              onClick={() => void upload()}
              disabled={busy || !file}
              className="btn-primary !px-3 !py-1.5 !text-[12px]"
            >
              {busy ? 'Uploading…' : 'Upload & share'}
            </button>
          </div>
        ) : (
          <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
            {fields.map((field) => (
              <input
                key={field.key}
                type={field.type ?? 'text'}
                placeholder={field.placeholder ?? field.label}
                aria-label={field.label}
                value={values[field.key] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                className="rounded-lg border border-[color:var(--line)] px-2.5 py-1.5 text-[12.5px]"
              />
            ))}
            <button
              onClick={() => void create()}
              disabled={busy || Object.values(values).every((v) => !v)}
              className="btn-primary !px-3 !py-1.5 !text-[12px] sm:col-span-2"
            >
              {busy ? 'Saving…' : 'Save to vault & share'}
            </button>
          </div>
        )}
        <p className="mt-1.5 text-[10px] leading-relaxed text-[color:var(--muted)]">
          Lands in the vault first, then is shared with one consented act — receipted, revocable.
        </p>
      </div>

      {error && <p className="mt-2 text-[11px] text-red-700">{error}</p>}
    </div>
  );
}
