'use client';

import type { DataSlot } from '@/app/api/data/route';
import { candidateSummary } from '@/lib/records';
import { SCHEMA_FIELDS, SINGLETON_TARGETS, type SchemaField } from '@/lib/schema-fields';
import { NEW_ITEM, type BulkFillForm } from '@/lib/use-bulk-fill';

/**
 * One slot of the one-act application form, shared by all three demos and styled by the brand's
 * tokens (radius, lines, mono). The multi-instance rule made visible: with vault candidates the
 * chips propose reuse (typing flips to a new draft); with none there are just inputs, and the
 * default label applies silently. Singletons are always a plain prefilled form.
 */

/** Fields that read better on a full row of the two-column grids. */
const WIDE_FIELDS = new Set(['streetAddress', 'accountNumber']);

const CONTROL_CLASS =
  'w-full rounded-[calc(var(--radius)*0.5)] border border-[color:var(--line)] bg-[color:var(--card)] px-3 py-2.5 text-[13px] font-mono tabular';

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.options) {
    return (
      <select
        aria-label={field.label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${CONTROL_CLASS} ${value ? '' : 'text-[color:var(--muted)]'}`}
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
    );
  }
  return (
    <input
      type={field.type ?? 'text'}
      placeholder={field.placeholder ?? field.label}
      aria-label={field.label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={CONTROL_CLASS}
    />
  );
}

export function BulkSlotFields({ slot, form }: { slot: DataSlot; form: BulkFillForm }) {
  const target = slot.target!;
  const fields = SCHEMA_FIELDS[target] ?? [];
  const values = form.values[slot.slotId] ?? {};
  const candidates = form.candidatesFor(slot.slotId);
  const granted =
    slot.status === 'granted' || slot.records.some((r) => r.type === 'document' && !r.subject);
  const offerReuse = !granted && !SINGLETON_TARGETS.has(target) && candidates.length > 0;
  const chosen = form.selection[slot.slotId] ?? NEW_ITEM;
  const drafting = offerReuse && chosen === NEW_ITEM;
  const wide = fields.length > 2;

  return (
    <div style={{ fontFamily: 'var(--font-inter)' }}>
      {offerReuse && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {candidates.map((candidate) => {
            const active = chosen === candidate.resourceId;
            const summary = candidateSummary(target, candidate.data);
            return (
              <button
                key={candidate.resourceId}
                type="button"
                aria-pressed={active}
                onClick={() => form.selectCandidate(slot, candidate.resourceId)}
                className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                  active
                    ? 'border-[color:var(--accent)] font-semibold text-[color:var(--accent)]'
                    : 'border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--accent)]'
                }`}
                title={summary}
              >
                {candidate.name || candidate.label || 'Saved item'}
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={drafting}
            onClick={() => form.selectNew(slot)}
            className={`rounded-full border border-dashed px-2.5 py-1 text-[11px] transition-colors ${
              drafting
                ? 'border-[color:var(--accent)] font-semibold text-[color:var(--accent)]'
                : 'border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--accent)]'
            }`}
          >
            + New
          </button>
        </div>
      )}

      <div
        className={`grid gap-2 ${wide ? 'sm:grid-cols-2' : fields.length === 2 ? 'grid-cols-2' : ''}`}
      >
        {fields.map((field) => (
          <div key={field.key} className={wide && WIDE_FIELDS.has(field.key) ? 'sm:col-span-2' : ''}>
            <FieldControl
              field={field}
              value={values[field.key] ?? ''}
              onChange={(value) => form.setField(slot.slotId, field.key, value)}
            />
          </div>
        ))}
        {drafting && (
          <input
            value={form.labels[slot.slotId] ?? ''}
            onChange={(e) => form.setLabel(slot.slotId, e.target.value)}
            placeholder="Label — how you find it in your vault"
            aria-label="Label in your vault"
            className={`${CONTROL_CLASS} ${wide || fields.length === 2 ? 'col-span-full' : ''} !font-[family-name:var(--font-inter)] text-[12px]`}
          />
        )}
      </div>

      {form.errors[slot.slotId] && (
        <p className="mt-1.5 text-[11px] text-red-700">{form.errors[slot.slotId]}</p>
      )}
    </div>
  );
}
