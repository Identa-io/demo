'use client';

import { useEffect, useState } from 'react';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';
import {
  addressLines,
  docData,
  fullName,
  maskedAccount,
  taxResidency,
} from '@/lib/records';
import { useDemoBase, useGeena } from '@/lib/use-geena';

/**
 * Account opening — the flagship flow. A KYC-grade application (identity, contact, residential
 * address, payout account, tax residency) that a person normally retypes for the n-th time.
 * Here it fills itself: one hop to Geena, one consent, and the sections arrive staggered, always
 * the current version. Account numbers and tax identifiers render masked — recognition, not
 * exposure, is what a review screen needs.
 */
export default function VinstRegister() {
  const base = useDemoBase('vinst');
  const { data, refresh } = useGeena('vinst');
  const [submitted, setSubmitted] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    setDenied(new URLSearchParams(window.location.search).has('denied'));
  }, []);

  const slots = data?.slots;
  const name = fullName(docData(slots, 'PersonFullName'));
  const email = String(docData(slots, 'PersonEmail')?.email ?? '');
  const phone = String(docData(slots, 'PersonPhone')?.telephone ?? '');
  const address = addressLines(docData(slots, 'PersonAddress'));
  const payout = maskedAccount(docData(slots, 'PersonBankAccount'));
  const tax = taxResidency(docData(slots, 'PersonTaxStatus'));

  const connected = data?.connected ?? false;
  const anythingGranted = !!(name || email || phone || address.length || payout || tax);
  const waitingOnGrants = connected && !data?.accessEnded && !anythingGranted;
  const complete = !!(name && email && (payout || tax));

  const sections: { title: string; rows: { label: string; value: string }[] }[] = [
    {
      title: 'Identity',
      rows: [
        { label: 'Full name', value: name },
        { label: 'Email', value: email },
        { label: 'Phone', value: phone },
      ],
    },
    {
      title: 'Residential address',
      rows: [{ label: 'Address', value: address.join(' · ') }],
    },
    {
      title: 'Payout account',
      rows: [{ label: 'Bank account', value: payout }],
    },
    {
      title: 'Tax residency',
      rows: [{ label: 'Residency', value: tax }],
    },
  ];

  let fieldIndex = 0;

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_19rem]">
      <section>
        <p className="eyebrow">Account opening</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
          Your application
        </h1>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[color:var(--muted)]">
          Regulation says we must know who you are, where you pay tax, and where withdrawals
          should go. It does not say you have to type it.
        </p>

        {submitted ? (
          <div className="card mt-6 p-8">
            <p className="eyebrow" style={{ color: 'var(--accent)' }}>
              Application received
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold">
              Welcome{name ? `, ${name.split(' ')[0]}` : ''}. Account VIN-2841 is being opened.
            </h2>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-[color:var(--muted)]">
              Simulated, of course — this is a demo. The substance is real though: every value in
              this application came from your vault under one consent, and if your address or
              account changes there, Vinst reads the current version next time. Nothing to
              re-upload, nothing stale.
            </p>
            <a href={`${base}/`} className="btn-secondary mt-6">
              Back to the funds
            </a>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {data && !data.configured && <StateNotice tone="info">{data.configureHint}</StateNotice>}

            {denied && !connected && (
              <StateNotice tone="denied">
                Nothing was shared — the application stays empty until you decide otherwise.
              </StateNotice>
            )}

            {data?.accessEnded && (
              <StateNotice tone="ended">
                Access ended: you revoked Vinst in your Geena, so this application can no longer
                read anything. Reconnect to continue — nothing survived on Vinst&apos;s side.
              </StateNotice>
            )}

            {waitingOnGrants && (
              <StateNotice tone="info">
                Connected. Now choose what to share:{' '}
                {data?.grantUrl && (
                  <a
                    href={data.grantUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline underline-offset-2"
                  >
                    open the request in your Geena
                  </a>
                )}{' '}
                — the application fills itself the moment you grant.
              </StateNotice>
            )}

            {(!connected || data?.accessEnded) && (
              <div className="card flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[14px] font-semibold">Fill the application from your vault</p>
                  <p className="mt-0.5 text-[12px] text-[color:var(--muted)]">
                    One hop, one consent screen — on Geena&apos;s page, never ours.
                  </p>
                </div>
                <GeenaButton demo="vinst" returnTo="/register" label="Fill with Geena" />
              </div>
            )}

            {sections.map((section) => (
              <div key={section.title} className="card p-5">
                <h2 className="text-[13px] font-semibold">{section.title}</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {section.rows.map((row) => {
                    const delay = row.value ? `${fieldIndex++ * 120}ms` : undefined;
                    return (
                      <div key={row.label} className={section.rows.length === 1 ? 'sm:col-span-2' : ''}>
                        <p className="field-label">{row.label}</p>
                        <div
                          key={row.value || 'empty'}
                          className={`mt-1 min-h-10 rounded-lg border border-[color:var(--line)] bg-[color:var(--bg)]/60 px-3 py-2 text-[14px] ${
                            row.value ? 'fill-in font-medium' : 'text-[color:var(--muted)]'
                          }`}
                          style={delay ? { animationDelay: delay } : undefined}
                        >
                          {row.value || 'Waiting for your vault'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={() => setSubmitted(true)}
              disabled={!complete}
              className="btn-primary w-full !py-3.5 !text-[14px]"
            >
              Submit application{complete ? '' : ' — waiting for identity and payout details'}
            </button>

            {connected && !data?.accessEnded && (
              <p className="text-center text-[11px] text-[color:var(--muted)]">
                Changed your mind?{' '}
                <button
                  onClick={async () => {
                    await fetch('/api/revoke?demo=vinst', { method: 'POST' });
                    void refresh();
                  }}
                  className="underline underline-offset-2 hover:opacity-70"
                >
                  Disconnect Geena
                </button>{' '}
                — Vinst keeps nothing.
              </p>
            )}
          </div>
        )}
      </section>

      <aside className="h-fit space-y-4">
        <div className="card p-5">
          <p className="eyebrow">How this works</p>
          <ol className="mt-3 space-y-3 text-[13px] leading-relaxed">
            {[
              ['Connect', 'One hop to Geena — sign in or sign up there. Vinst never sees a password or a code.'],
              ['Consent', 'One screen lists exactly what Vinst asks for, and why. You choose item by item.'],
              ['Review & submit', 'The application fills itself. Sensitive identifiers render masked here.'],
            ].map(([title, text], index) => (
              <li key={title} className="flex gap-3">
                <span
                  className="tabular flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: 'var(--ink)' }}
                >
                  {index + 1}
                </span>
                <span>
                  <strong className="font-semibold">{title}.</strong>{' '}
                  <span className="text-[color:var(--muted)]">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="card p-5">
          <p className="eyebrow">Why we ask</p>
          <p className="mt-2 text-[12px] leading-relaxed text-[color:var(--muted)]">
            Identity and tax residency are required under KYC/AML rules; the payout account is
            where withdrawals go. The consent screen states the legal basis and the retention
            period — the same facts, shown to you before anything moves.
          </p>
        </div>
      </aside>
    </main>
  );
}
