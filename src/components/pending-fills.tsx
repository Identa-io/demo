'use client';

import type { DataSlot } from '@/app/api/data/route';
import type { DemoSlug } from '@/lib/demos';
import { SlotFiller } from './slot-filler';

/**
 * Every recipient slot still pending, fillable in place — the "user only ever leaves the app to
 * log in and consent" model made visible. Family-member slots are handled by the FamilyManager,
 * never here.
 */
export function PendingFills({
  demo,
  slots,
  onChanged,
  title,
}: {
  demo: DemoSlug;
  slots: DataSlot[] | undefined;
  onChanged: () => void;
  title?: string;
}) {
  const pending = (slots ?? []).filter((slot) => slot.status === 'pending' && !slot.subject);
  if (pending.length === 0) return null;

  return (
    <div className="card p-4" style={{ fontFamily: 'var(--font-inter)' }}>
      <p className="eyebrow">{title ?? 'Complete it here'}</p>
      <div className="mt-2.5 space-y-2.5">
        {pending.map((slot) => (
          <div key={slot.slotId} className="flex flex-wrap items-center gap-2.5">
            <span className="w-40 shrink-0 text-[12px] text-[color:var(--muted)]">
              {slot.label ?? slot.target}
            </span>
            <SlotFiller demo={demo} slot={slot} onFilled={onChanged} />
          </div>
        ))}
      </div>
      <p className="mt-2.5 text-[10px] leading-relaxed text-[color:var(--muted)]">
        Pick something already in your vault, or add it new — each share is one consented, receipted
        act, and you never leave this page.
      </p>
    </div>
  );
}
