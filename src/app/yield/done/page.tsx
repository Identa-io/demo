'use client';

import { StateNotice } from '@/components/demo-chrome';
import {
  addressLines,
  docData,
  fullName,
  maskedAccount,
  maskedDocument,
  taxResidency,
} from '@/lib/records';
import { useDemoBase, useGeena, useJourneyAdvanceHref } from '@/lib/use-geena';
import { YieldHeader } from '../header';

/**
 * Yield — screen 3 of 3, the finish: an engraved welcome over the statement of record (read
 * LIVE from the vault — nothing was copied), closing on the double rule, with the deep-green
 * handoff panel pivoting the journey to chapter 2.
 */
export default function YieldDone() {
  const base = useDemoBase('yield');
  const { data } = useGeena('yield');
  const advance = useJourneyAdvanceHref('yield', 'signalio');

  const slots = data?.slots;
  const name = fullName(docData(slots, 'PersonFullName'));
  const ready = (data?.connected ?? false) && !data?.accessEnded && !!name;

  const rows: [string, string][] = [
    ['Account holder', name],
    ['Date of birth', String(docData(slots, 'PersonBirthDetails')?.dateOfBirth ?? '')],
    ['Identity document', maskedDocument(docData(slots, 'PersonIdentityDocument'))],
    ['Email', String(docData(slots, 'PersonEmail')?.email ?? '')],
    ['Phone', String(docData(slots, 'PersonPhone')?.telephone ?? '')],
    ['Residential address', addressLines(docData(slots, 'PersonAddress')).join(' · ')],
    ['Payout account', maskedAccount(docData(slots, 'PersonBankAccount'))],
    ['Tax residency', taxResidency(docData(slots, 'PersonTaxStatus'))],
  ];

  return (
    <>
      <YieldHeader variant="centered" />
      <main className="mx-auto w-full max-w-3xl px-6 py-14">
        {!ready ? (
          <div className="flex flex-col items-start gap-4">
            <StateNotice tone="info">
              The account is not open yet — finish the application first.
            </StateNotice>
            <a href={`${base}/apply`} className="btn-primary">
              Back to the application
            </a>
          </div>
        ) : (
          <>
            <p className="eyebrow">Account opened</p>
            <h1 className="font-display mt-3 text-[44px] font-semibold leading-[1.15]">
              Welcome to Yield{name ? `, ${name.split(' ')[0]}` : ''}.
            </h1>
            <p className="mt-3 max-w-lg text-[14.5px] leading-[1.7] text-[color:var(--muted)]">
              Account <span className="font-mono text-[0.88em]">YLD-2026-0841</span> is open
              (simulated).
            </p>

            {/* The statement of record: read live from the vault, closed over a double rule. */}
            <div className="mt-9 border border-[color:var(--line)] bg-[color:var(--card)] p-7">
              <div className="ledger-open flex items-baseline justify-between pt-3">
                <h2 className="font-display text-[19px] font-semibold">Account data on file</h2>
              </div>
              <dl className="mt-3.5 flex flex-col gap-[11px]">
                {rows.map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-4">
                    <dt className="shrink-0 text-[12.5px] text-[color:var(--muted)]">{label}</dt>
                    <dd className="font-mono tabular min-w-0 truncate text-right text-[12px]">
                      {value || '—'}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="ledger-close mt-4 flex items-baseline justify-between pb-2.5 pt-2">
                <span className="font-display text-[16px] font-semibold">Typed by you, once</span>
              </div>
            </div>

            {/* The handoff — where the journey pivots. */}
            <div className="mt-9 p-8 text-[#f5f3ea]" style={{ background: 'var(--cta)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f5f3ea]/65">
                Next — chapter 2 of 3
              </p>
              <h2 className="font-display mt-3 text-[28px] font-semibold">
                See what &ldquo;once&rdquo; just bought you.
              </h2>
              <p className="mt-2.5 max-w-md text-[13.5px] leading-[1.7] text-[#f5f3ea]/80">
                Signalio, a market-research subscription, asks for four things — every one of them
                already in your vault. You will not type anything. Watch how little happens.
              </p>
              <a
                href={advance}
                className="mt-5 inline-flex items-center gap-2 bg-[#f5f3ea] px-[22px] py-[11px] text-[12px] font-semibold uppercase tracking-[0.1em] transition-opacity hover:opacity-90"
                style={{ color: 'var(--cta)', fontFamily: 'var(--font-inter)' }}
              >
                Continue to Signalio →
              </a>
            </div>
          </>
        )}
      </main>
    </>
  );
}
