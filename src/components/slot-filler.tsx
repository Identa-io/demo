'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DataSlot } from '@/app/api/data/route';
import type { CandidateItem, CandidatesResponse } from '@/lib/geena/partner';
import type { DemoSlug } from '@/lib/demos';
import { candidateSummary } from '@/lib/records';
import { LABEL_OPTIONS, SCHEMA_FIELDS, SINGLETON_TARGETS } from '@/lib/schema-fields';

/**
 * The in-app fill control for one pending slot, open by default — no extra click between the
 * person and their data. Two shapes, decided by the schema:
 *
 *  - SINGLETON (one legal name, one birth date): a value form, nothing to pick — prefilled from
 *    the vault's current value when one exists; under the hood the existing document (often the
 *    empty starter) is attached and written, or created when none exists.
 *  - MULTI-INSTANCE (emails, phones, addresses, accounts): the vault's candidates listed by
 *    their labels for a one-tap pick, plus an inline create that asks for a label of its own —
 *    "Work", "Mobile" — so the vault stays navigable.
 *
 * With `current` set the same control becomes the UPDATE surface for an already-granted slot: a
 * form prefilled from the served record, "Push update" writes the change into the vault through
 * the delegated-write path (edit verb) — the org reads the current version on its next read.
 * `bare` drops the card chrome and title for embedding inside a statement row.
 *
 * Every act is user-present, receipted on the Geena side, and never leaves the page.
 */
export function SlotFiller({
  demo,
  slot,
  person,
  current,
  bare,
  onFilled,
}: {
  demo: DemoSlug;
  slot: DataSlot;
  person?: string;
  current?: Record<string, unknown>;
  bare?: boolean;
  onFilled: () => void;
}) {
  const labelOptions = slot.target ? LABEL_OPTIONS[slot.target] : undefined;
  const fields = slot.target ? (SCHEMA_FIELDS[slot.target] ?? []) : [];
  const updateMode = !!current;

  const [candidates, setCandidates] = useState<CandidateItem[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() => {
    if (!current) return {};
    const initial: Record<string, string> = {};
    for (const field of fields) {
      const v = current[field.key];
      if (typeof v === 'string' || typeof v === 'number') initial[field.key] = String(v);
    }
    return initial;
  });
  const [prefilled, setPrefilled] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [label, setLabel] = useState(labelOptions?.[0] ?? '');
  const [customLabel, setCustomLabel] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filePicker = useRef<HTMLInputElement>(null);
  // Whether the person edited the file label themselves — a hand-typed name survives re-picks,
  // a proposed one follows the file.
  const labelTouched = useRef(false);

  const isFile = slot.kind === 'PERSONAL_FILES';
  const singleton = !!slot.target && SINGLETON_TARGETS.has(slot.target);

  const load = useCallback(async () => {
    if (updateMode) return; // the update form starts from the served record, nothing to list
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
    // Singleton forms start from the vault's current value — the whole point of "one value per
    // person" is that you correct it, not retype it. Never clobber something already typed.
    const current = singleton ? body.candidates?.[0]?.data : undefined;
    if (current) {
      const initial: Record<string, string> = {};
      for (const field of fields) {
        const v = current[field.key];
        if (typeof v === 'string' || typeof v === 'number') initial[field.key] = String(v);
      }
      if (Object.values(initial).some(Boolean)) {
        setValues((prev) => {
          if (Object.values(prev).some(Boolean)) return prev;
          setPrefilled(true);
          return initial;
        });
      }
    }
    // fields derives from slot.target, already a dependency via slot.slotId's stability.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, slot.slotId, person, singleton, updateMode]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const data = () => Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ''));

  const setSingleton = () =>
    run(() =>
      fetch('/api/fill/set', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ demo, slotId: slot.slotId, data: data(), person }),
      }),
    );

  const pushUpdate = () =>
    run(() =>
      fetch('/api/fill/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ demo, slotId: slot.slotId, data: data() }),
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
          data: data(),
          person,
          name: label.trim() || undefined,
        }),
      }),
    );

  const upload = () =>
    run(() => {
      const form = new FormData();
      form.set('demo', demo);
      form.set('slotId', slot.slotId);
      if (label.trim()) form.set('label', label.trim());
      if (file) form.set('file', file, file.name);
      return fetch('/api/fill/upload', { method: 'POST', body: form });
    });

  const fieldInputs = fields.map((field) =>
    field.options ? (
      <select
        key={field.key}
        aria-label={field.label}
        value={values[field.key] ?? ''}
        onChange={(e) => {
          setDirty(true);
          setValues((prev) => ({ ...prev, [field.key]: e.target.value }));
        }}
        className={`rounded-lg border border-[color:var(--line)] bg-[color:var(--card)] px-2 py-1.5 text-[12.5px] ${
          values[field.key] ? '' : 'text-[color:var(--muted)]'
        }`}
      >
        <option value="" disabled>
          {field.label}
        </option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        key={field.key}
        type={field.type ?? 'text'}
        placeholder={field.placeholder ?? field.label}
        aria-label={field.label}
        value={values[field.key] ?? ''}
        onChange={(e) => {
          setDirty(true);
          setValues((prev) => ({ ...prev, [field.key]: e.target.value }));
        }}
        className="rounded-lg border border-[color:var(--line)] px-2.5 py-1.5 text-[12.5px]"
      />
    ),
  );
  const empty = Object.values(values).every((v) => !v);

  return (
    <div
      className={
        bare ? '' : 'rounded-xl border border-[color:var(--line)] bg-[color:var(--card)] p-3.5'
      }
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      {!bare && <p className="text-[12px] font-semibold">{slot.label ?? slot.target}</p>}

      {updateMode ? (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {fieldInputs}
          <button
            onClick={() => void pushUpdate()}
            disabled={busy || !dirty || empty}
            className="btn-primary !px-3 !py-1.5 !text-[12px] sm:col-span-2"
          >
            {busy ? 'Saving…' : dirty ? 'Push update' : 'Up to date'}
          </button>
          <p className="text-[10px] leading-relaxed text-[color:var(--muted)] sm:col-span-2">
            The change lands in your vault first — the organization reads the current version on its
            next read. Nothing emailed, nothing retyped.
          </p>
        </div>
      ) : isFile ? (
        <div className="mt-2 grid gap-2">
          {/* The picker itself is invisible; a real button opens it — a bare "choose file"
              control is too easy to miss. Picking proposes the vault name from the filename. */}
          <input
            ref={filePicker}
            type="file"
            className="hidden"
            aria-hidden
            tabIndex={-1}
            onChange={(e) => {
              const picked = e.target.files?.[0] ?? null;
              e.target.value = ''; // so re-picking the same file still fires
              if (!picked) return;
              setFile(picked);
              const proposed = picked.name.replace(/\.[^.]+$/, '');
              setLabel((prev) => (labelTouched.current && prev ? prev : proposed));
            }}
          />
          {!file ? (
            <button
              onClick={() => filePicker.current?.click()}
              className="btn-secondary !px-3 !py-2 !text-[12.5px]"
            >
              Choose a file…
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => filePicker.current?.click()}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-[color:var(--line)] px-3 py-2 hover:border-[color:var(--accent)]"
              >
                <span className="vault-value truncate text-[12.5px]">{file.name}</span>
                <span
                  className="shrink-0 text-[10px] font-semibold"
                  style={{ color: 'var(--accent)' }}
                >
                  change
                </span>
              </button>
              <div>
                <p className="field-label">Save as</p>
                <input
                  value={label}
                  onChange={(e) => {
                    labelTouched.current = true;
                    setLabel(e.target.value);
                  }}
                  aria-label="Name in your vault"
                  className="mt-1 w-full rounded-lg border border-[color:var(--line)] px-2.5 py-1.5 text-[12.5px]"
                />
              </div>
              <button
                onClick={() => void upload()}
                disabled={busy}
                className="btn-primary !px-3 !py-1.5 !text-[12px]"
              >
                {busy ? 'Uploading…' : 'Upload & share'}
              </button>
            </>
          )}
        </div>
      ) : singleton ? (
        candidates === null ? (
          <p className="mt-2 text-[12px] text-[color:var(--muted)]">Checking your vault…</p>
        ) : (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {fieldInputs}
            <button
              onClick={() => void setSingleton()}
              disabled={busy || empty}
              className="btn-primary !px-3 !py-1.5 !text-[12px] sm:col-span-2"
            >
              {busy ? 'Saving…' : prefilled && !dirty ? 'Confirm & share' : 'Save & share'}
            </button>
            <p className="text-[10px] leading-relaxed text-[color:var(--muted)] sm:col-span-2">
              {prefilled
                ? 'Filled from your vault — correct it if life moved on, then share.'
                : 'One value per person — this fills it in your vault and shares it in the same act.'}
            </p>
          </div>
        )
      ) : (
        <>
          {candidates === null ? (
            <p className="mt-2 text-[12px] text-[color:var(--muted)]">Checking your vault…</p>
          ) : candidates.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {candidates.map((candidate) => (
                <li key={candidate.resourceId}>
                  <button
                    onClick={() => void attach(candidate.resourceId)}
                    disabled={busy || candidate.granted}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-[color:var(--line)] px-3 py-2 hover:border-[color:var(--accent)] disabled:opacity-50"
                  >
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-[12px] font-medium">
                        {candidate.name || candidate.label || candidate.fileName || 'Item'}
                      </span>
                      {candidateSummary(slot.target, candidate.data) && (
                        <span className="vault-value block truncate text-[11.5px] text-[color:var(--muted)]">
                          {candidateSummary(slot.target, candidate.data)}
                        </span>
                      )}
                    </span>
                    <span
                      className="shrink-0 text-[10px] font-semibold"
                      style={{ color: 'var(--accent)' }}
                    >
                      {candidate.granted
                        ? 'shared'
                        : !slot.multiple && candidates.some((c) => c.granted)
                          ? 'switch to this'
                          : 'use this'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div
            className={
              candidates?.length ? 'mt-3 border-t border-[color:var(--line)] pt-2.5' : 'mt-2'
            }
          >
            {candidates !== null && (
              <p className="field-label">
                {/* Cardinality decides the verb (slot-cardinality): a single slot's new value
                    REPLACES the shared one server-side; only a multiple slot accrues. */}
                {!candidates.length
                  ? 'Add it'
                  : !slot.multiple && candidates.some((c) => c.granted)
                    ? 'Or replace it with a new one'
                    : 'Or add another'}
              </p>
            )}
            <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
              {labelOptions && !customLabel ? (
                <div className="flex flex-wrap items-center gap-1.5 sm:col-span-2">
                  {labelOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLabel(option)}
                      aria-pressed={label === option}
                      className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                        label === option
                          ? 'border-[color:var(--accent)] font-semibold text-[color:var(--accent)]'
                          : 'border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--accent)]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setCustomLabel(true);
                      setLabel('');
                    }}
                    className="rounded-full border border-dashed border-[color:var(--line)] px-2.5 py-1 text-[11px] text-[color:var(--muted)] hover:border-[color:var(--accent)]"
                  >
                    Other…
                  </button>
                </div>
              ) : (
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Label — how you find it later"
                  aria-label="Label"
                  autoFocus={customLabel}
                  className="rounded-lg border border-[color:var(--line)] px-2.5 py-1.5 text-[12.5px] sm:col-span-2"
                />
              )}
              {fieldInputs}
              <button
                onClick={() => void create()}
                disabled={busy || empty}
                className="btn-primary !px-3 !py-1.5 !text-[12px] sm:col-span-2"
              >
                {busy ? 'Saving…' : 'Save to vault & share'}
              </button>
            </div>
          </div>
        </>
      )}

      {error && <p className="mt-2 text-[11px] text-red-700">{error}</p>}
    </div>
  );
}
