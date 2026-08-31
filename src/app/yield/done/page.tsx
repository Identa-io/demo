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

/**
 * Yield — screen 3 of 3, the finish. The account is open; the statement below is read LIVE from
 * the vault (nothing was copied), and the handoff card pivots the story: chapter 1's typing is
 * the last typing of the journey.
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
    <main className="mx-auto max-w-3xl px-6 py-12">
      {!ready ? (
        <div className="space-y-4">
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
          <h1 className="font-display mt-2 text-[34px] font-semibold leading-tight tracking-tight">
            Welcome to Yield{name ? `, ${name.split(' ')[0]}` : ''}.
          </h1>
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[color:var(--muted)]">
            Account <span className="vault-value">YLD-2026-0841</span> is open (simulated). KYC
            complete — and you will never retype a word of it.
          </p>

          {/* The statement of record: read live from the vault, closed over a double rule. */}
          <div className="card mt-8 p-6">
            <div className="ledger-open flex items-baseline justify-between pt-3">
              <h2 className="text-[13px] font-semibold">Account data on file</h2>
              <span className="vault-value text-[10px] text-[color:var(--muted)]">
                served live from your vault
              </span>
            </div>
            <dl className="mt-3 space-y-2.5">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4">
                  <dt className="shrink-0 text-[12px] text-[color:var(--muted)]">{label}</dt>
                  <dd className="vault-value min-w-0 truncate text-right text-[12.5px]">
                    {value || '—'}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="ledger-close mt-4 flex items-baseline justify-between pb-2.5 pt-2">
              <span className="text-[12px] font-semibold">Typed by you, once</span>
              <span className="vault-value text-[12px]">8 data points</span>
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--muted)]">
            You typed your details once — into your vault, not our form. Change any of them, here
            or in Geena, and Yield reads the current version on its next read.
          </p>

          {/* The handoff — where the journey pivots. */}
          <div
            className="mt-8 rounded-2xl p-6 text-white"
            style={{ background: 'var(--ink)' }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-70">
              Next — chapter 2 of 3
            </p>
            <h2 className="font-display mt-2 text-[22px] font-semibold tracking-tight">
              See what &ldquo;once&rdquo; just bought you.
            </h2>
            <p className="mt-1.5 max-w-md text-[13px] leading-relaxed opacity-80">
              Signalio, a market-research subscription, asks for four things — every one of them
              already in your vault. You will not type anything. Watch how little happens.
            </p>
            <a
              href={advance}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-black transition-transform hover:scale-[1.02]"
            >
              Continue to Signalio →
            </a>
          </div>
        </>
      )}
    </main>
  );
}
