'use client';

import { useEffect, useState } from 'react';
import { StateNotice } from '@/components/demo-chrome';
import { ageFrom, docData, familyFromSlots, fullName, slotByKind } from '@/lib/records';
import { useDemoBase, useGeena, useJourneyAdvanceHref } from '@/lib/use-geena';
import { isDestination, tripPrice, type Destination } from '../pricing';

/**
 * Cover — screen 3 of 3, and the journey's finale. The policy schedule is the product; the
 * epilogue below it is the point of the whole demo: three connections, one vault, the scoreboard
 * of what was typed versus what was delivered — and where to go watch (or end) the access.
 */
export default function CoverDone() {
  const base = useDemoBase('cover');
  const { data } = useGeena('cover');
  const finish = useJourneyAdvanceHref('cover');

  const [destination, setDestination] = useState<Destination>('Europe');
  const [days, setDays] = useState(7);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dest = params.get('destination');
    if (isDestination(dest)) setDestination(dest);
    const parsedDays = Number(params.get('days'));
    if (Number.isFinite(parsedDays) && parsedDays >= 1 && parsedDays <= 30) {
      setDays(Math.round(parsedDays));
    }
  }, []);

  const slots = data?.slots;
  const holderName = fullName(docData(slots, 'PersonFullName'));
  const children = familyFromSlots(slots);
  const switching = !!slotByKind(slots, 'PERSONAL_FILES')?.records?.some(
    (record) => record.type === 'file',
  );
  const ready = (data?.connected ?? false) && !data?.accessEnded && !!holderName;

  const price = tripPrice({ destination, days, childCount: children.length, switching });
  const childrenTyped = children.length * 2;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {!ready ? (
        <div className="space-y-4">
          <StateNotice tone="info">No policy yet — finish the quote first.</StateNotice>
          <a href={`${base}/quote`} className="btn-primary">
            Back to the quote
          </a>
        </div>
      ) : (
        <>
          <p className="eyebrow">Policy issued</p>
          <h1 className="font-display mt-2 text-[34px] font-bold leading-tight tracking-tight">
            Have a good trip{holderName ? `, ${holderName.split(' ')[0]}` : ''}.
          </h1>
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[color:var(--muted)]">
            Policy <span className="vault-value">COV-2026-0847</span> issued (simulated) —{' '}
            {destination}, {days} {days === 1 ? 'day' : 'days'}, {1 + children.length} traveller
            {children.length ? 's' : ''}. Documents by email, in a real Cover anyway.
          </p>

          {/* The policy schedule — leaders, the way schedules have always read. */}
          <div className="card mt-8 p-6">
            <h2 className="text-[13px] font-semibold">Schedule of insured persons</h2>
            <ul className="mt-3 divide-y divide-[color:var(--line)]">
              <li className="leader-row py-2.5">
                <span className="vault-value text-[13px] font-semibold">{holderName}</span>
                <span className="leader-fill" aria-hidden />
                <span className="tabular text-[12.5px] font-semibold">
                  €{price.adult.toFixed(2)}
                </span>
              </li>
              {children.map((child) => {
                const age = child.dateOfBirth ? ageFrom(child.dateOfBirth) : null;
                return (
                  <li key={child.alias} className="leader-row py-2.5">
                    <span className="vault-value min-w-0 truncate text-[13px] font-semibold">
                      {child.name || 'Child'}
                      {age != null && (
                        <span className="font-normal text-[color:var(--muted)]"> · {age} y</span>
                      )}
                    </span>
                    <span className="leader-fill" aria-hidden />
                    <span className="tabular text-[12.5px] font-semibold">
                      €{price.perChild.toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 space-y-1.5 border-t border-[color:var(--line)] pt-3 text-[12px]">
              {switching && (
                <div className="leader-row">
                  <span className="text-[color:var(--muted)]">Switching discount</span>
                  <span className="leader-fill" aria-hidden />
                  <span className="tabular font-semibold" style={{ color: 'var(--accent)' }}>
                    −€{price.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="leader-row">
                <span className="font-semibold">Total premium</span>
                <span className="leader-fill" aria-hidden />
                <span className="tabular text-[14px] font-bold">€{price.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* The epilogue — the journey's argument, stated once, with the receipts. */}
          <div className="mt-8 rounded-2xl p-6 text-white" style={{ background: 'var(--ink)' }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-70">
              Journey complete
            </p>
            <h2 className="font-display mt-2 text-[22px] font-bold tracking-tight">
              Three companies. One vault. {8 + childrenTyped} things typed.
            </h2>
            <div className="mt-4 space-y-2 text-[12.5px]">
              {[
                ['Chapter 1 · Yield', 'you typed 8 data points — into your vault'],
                ['Chapter 2 · Signalio', 'you typed nothing'],
                [
                  'Chapter 3 · Cover',
                  `you typed ${childrenTyped || 'nothing'}${childrenTyped ? ` (${children.length} ${children.length === 1 ? 'child' : 'children'})` : ' — the kids were optional'}${switching ? ' + shared one file' : ''}`,
                ],
              ].map(([chapter, fact]) => (
                <div key={chapter} className="flex items-baseline justify-between gap-4">
                  <span className="shrink-0 font-semibold">{chapter}</span>
                  <span className="min-w-0 text-right opacity-80">{fact}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 max-w-lg text-[13px] leading-relaxed opacity-80">
              Every value each company holds is served live from your vault — change your phone
              number once and Yield reads the new version. And it stays yours:{' '}
              {data?.grantUrl ? (
                <a href={data.grantUrl} className="underline underline-offset-2">
                  open your Geena
                </a>
              ) : (
                'open your Geena'
              )}{' '}
              to see all three connections, every read receipted — and revoke any of them.
              Revoking is not a preference: their access actually ends.
            </p>
            <p className="mt-3 text-[12px] italic opacity-60">
              Run the journey again and chapter 3 types itself too — the children are vault data
              now.
            </p>
            <a
              href={finish}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-black transition-transform hover:scale-[1.02]"
            >
              Back to the journey →
            </a>
          </div>
        </>
      )}
    </main>
  );
}
