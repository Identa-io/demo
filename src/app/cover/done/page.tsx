'use client';

import { useEffect, useState } from 'react';
import { StateNotice } from '@/components/demo-chrome';
import {
  ageFrom,
  docData,
  familyFromSlots,
  fullName,
  passengerCode,
  slotByKind,
} from '@/lib/records';
import { useDemoBase, useGeena, useJourneyAdvanceHref } from '@/lib/use-geena';
import { isDestination, tripPrice, ZONE_NAME, type Destination } from '../pricing';

/**
 * Cover — screen 3 of 3, and the journey's finale. The policy is printed as the boarding pass
 * it always wanted to be — passengers set airline-style from live vault data, the discount
 * stamped, the barcode closing the stub — and the dark epilogue below it states the whole
 * demo's argument, with the receipts.
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
  const dayWord = days === 1 ? 'DAY' : 'DAYS';

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {!ready ? (
        <div className="flex flex-col items-start gap-4">
          <StateNotice tone="info">No policy yet — finish the quote first.</StateNotice>
          <a href={`${base}/quote`} className="btn-primary">
            Back to the quote
          </a>
        </div>
      ) : (
        <>
          <p className="eyebrow">Policy issued</p>
          <h1 className="mt-3 text-[36px] font-extrabold leading-[1.15] tracking-[-0.02em]">
            Have a good trip{holderName ? `, ${holderName.split(' ')[0]}` : ''}.
          </h1>
          <p className="mt-2.5 max-w-lg text-[14px] leading-[1.65] text-[color:var(--muted)]">
            Policy <span className="font-mono text-[0.95em]">COV-2026-0847</span> issued
            (simulated) — {destination}, {days} {dayWord.toLowerCase()}, {1 + children.length}{' '}
            traveller{children.length ? 's' : ''}. Documents by email, in a real Cover anyway.
          </p>

          {/* The policy, printed as the boarding pass it is. */}
          <div className="card mt-8 overflow-hidden !shadow-[0_12px_32px_rgba(27,39,51,0.08)]">
            <div className="px-[26px] pb-5 pt-5">
              <div className="font-mono flex items-baseline justify-between text-[10px] tracking-[0.1em] text-[color:var(--mono-muted)]">
                <span>COVER / FAMILY POLICY</span>
                <span>NO. COV-2026-0847</span>
              </div>
              <div className="mt-3.5 flex items-center gap-4.5">
                <span className="text-[30px] font-extrabold tracking-[0.02em]">AMS</span>
                <span
                  className="flex-1"
                  style={{ borderTop: '2px dotted var(--dotted)' }}
                  aria-hidden
                />
                <span className="text-[30px] font-extrabold tracking-[0.02em]">LIS</span>
              </div>
              <div className="font-mono mt-1 flex justify-between text-[9.5px] text-[color:var(--mono-muted)]">
                <span>AMSTERDAM</span>
                <span>
                  {days} {dayWord} / {ZONE_NAME[destination]}
                </span>
                <span>LISBON</span>
              </div>
            </div>
            <div className="tear" />
            <div className="px-[26px] pb-6 pt-4.5">
              <p className="font-mono text-[9.5px] tracking-[0.1em] text-[color:var(--mono-muted)]">
                SCHEDULE OF INSURED PERSONS — SERVED LIVE FROM YOUR VAULT
              </p>
              <div className="font-mono mt-3 flex flex-col gap-[9px] text-[12.5px]">
                <div className="leader-row">
                  <span>{passengerCode(holderName)}</span>
                  <span className="text-[11px] text-[color:var(--mono-muted)]">ADULT</span>
                  <span className="leader-fill" aria-hidden />
                  <span className="font-semibold">€{price.adult.toFixed(2)}</span>
                </div>
                {children.map((child) => {
                  const age = child.dateOfBirth ? ageFrom(child.dateOfBirth) : null;
                  return (
                    <div key={child.alias} className="leader-row">
                      <span className="min-w-0 truncate">
                        {passengerCode(child.name || 'Child')}
                      </span>
                      <span className="shrink-0 text-[11px] text-[color:var(--mono-muted)]">
                        CHILD{age != null ? ` · ${age}Y` : ''}
                      </span>
                      <span className="leader-fill" aria-hidden />
                      <span className="font-semibold">€{price.perChild.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3.5 flex flex-col gap-[7px] border-t border-[#e8ebed] pt-3 text-[12px]">
                {switching && (
                  <div className="leader-row">
                    <span className="text-[color:var(--mono-muted)]">Switching discount</span>
                    <span className="leader-fill" aria-hidden />
                    <span className="font-mono font-semibold" style={{ color: 'var(--stamp)' }}>
                      −€{price.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="leader-row">
                  <span className="font-bold">Total premium</span>
                  <span className="leader-fill" aria-hidden />
                  <span className="font-mono text-[14px] font-semibold">
                    €{price.total.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="barcode mt-4 h-9" aria-hidden />
            </div>
          </div>

          {/* The epilogue — the journey's argument, stated once, with the receipts. */}
          <div
            className="mt-8 rounded-[14px] px-[30px] py-[26px]"
            style={{ background: 'var(--ink)', color: '#f2f6f9' }}
          >
            <p className="font-mono text-[10px] tracking-[0.18em]" style={{ color: '#8fa6b5' }}>
              JOURNEY COMPLETE
            </p>
            <h2 className="mt-2.5 text-[24px] font-extrabold tracking-[-0.01em]">
              Three companies. One vault. {8 + childrenTyped} things typed.
            </h2>
            <div className="mt-4 flex flex-col gap-2 text-[12.5px]">
              {[
                ['Chapter 1 · Yield', 'you typed 8 data points — into your vault'],
                ['Chapter 2 · Signalio', 'you typed nothing'],
                [
                  'Chapter 3 · Cover',
                  `you typed ${
                    childrenTyped
                      ? `${childrenTyped} (${children.length} ${children.length === 1 ? 'child' : 'children'})`
                      : 'nothing — the kids were optional'
                  }${switching ? ' + shared one file' : ''}`,
                ],
              ].map(([chapter, fact]) => (
                <div key={chapter} className="flex items-baseline justify-between gap-4">
                  <span className="shrink-0 font-bold">{chapter}</span>
                  <span className="min-w-0 text-right" style={{ color: '#aebcc7' }}>
                    {fact}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 max-w-lg text-[13px] leading-[1.65]" style={{ color: '#aebcc7' }}>
              Every value each company holds is served live from your vault — change your phone
              number once and Yield reads the new version. And it stays yours:{' '}
              {data?.grantUrl ? (
                <a
                  href={data.grantUrl}
                  className="underline underline-offset-2"
                  style={{ color: '#f2f6f9' }}
                >
                  open your Geena
                </a>
              ) : (
                'open your Geena'
              )}{' '}
              to see all three connections, every read receipted — and revoke any of them.
              Revoking is not a preference: their access actually ends.
            </p>
            <p className="mt-3 text-[12px] italic" style={{ color: '#8fa6b5' }}>
              Run the journey again and chapter 3 types itself too — the children are vault data
              now.
            </p>
            <a
              href={finish}
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold transition-transform hover:scale-[1.02]"
              style={{ background: '#f2f6f9', color: 'var(--ink)' }}
            >
              Back to the journey →
            </a>
          </div>
        </>
      )}
    </main>
  );
}
