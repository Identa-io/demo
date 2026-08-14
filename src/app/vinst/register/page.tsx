'use client';

import { useEffect, useState } from 'react';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';
import { SlotFiller } from '@/components/slot-filler';
import {
  addressLines,
  docData,
  fullName,
  maskedAccount,
  slotByTarget,
  taxResidency,
} from '@/lib/records';
import { useGeena } from '@/lib/use-geena';

/**
 * The account surface — the flagship flow, and deliberately NOT a one-shot application. The
 * statement lists the KYC-grade data Vinst holds (identity, contact, residential address,
 * payout account, tax residency); every row is live: an empty row carries its fill control in
 * place, a filled row opens into an update form that writes the change into the vault through
 * the delegated-write path — so a moved house or a new payout account is corrected HERE and the
 * organization reads the current version. Account numbers and tax identifiers render masked —
 * recognition, not exposure, is what a review screen needs.
 */
export default function VinstAccount() {
  const { data, refresh } = useGeena('vinst');
  const [denied, setDenied] = useState(false);
  const [openTarget, setOpenTarget] = useState<string | null>(null);

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
  const managing = connected && !data?.accessEnded;

  const sections: {
    title: string;
    rows: { label: string; target: string; value: string }[];
  }[] = [
    {
      title: 'Identity',
      rows: [
        { label: 'Full name', target: 'PersonFullName', value: name },
        { label: 'Email', target: 'PersonEmail', value: email },
        { label: 'Phone', target: 'PersonPhone', value: phone },
      ],
    },
    {
      title: 'Residential address',
      rows: [{ label: 'Address', target: 'PersonAddress', value: address.join(' · ') }],
    },
    {
      title: 'Payout account',
      rows: [{ label: 'Bank account', target: 'PersonBankAccount', value: payout }],
    },
    {
      title: 'Tax residency',
      rows: [{ label: 'Residency', target: 'PersonTaxStatus', value: tax }],
    },
  ];

  const completedSections = sections.filter((section) =>
    section.rows.some((row) => row.value),
  ).length;

  let fieldIndex = 0;

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_19rem]">
      <section>
        <p className="eyebrow">Vinst account</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
          {name ? name : 'Your account data'}
        </h1>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[color:var(--muted)]">
          Regulation says we must hold current data on who you are, where you pay tax, and where
          withdrawals go. It does not say you have to retype it when life changes.
        </p>

        <div className="mt-6 space-y-4">
          {data && !data.configured && <StateNotice tone="info">{data.configureHint}</StateNotice>}

          {denied && !connected && (
            <StateNotice tone="denied">
              Nothing was shared — the account stays empty until you decide otherwise.
            </StateNotice>
          )}

          {data?.accessEnded && (
            <StateNotice tone="ended">
              Access ended: you revoked Vinst in your Geena, so this account can no longer read
              anything. Reconnect to continue — nothing survived on Vinst&apos;s side.
            </StateNotice>
          )}

          {(!connected || data?.accessEnded) && (
            <div className="card flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-[14px] font-semibold">Open your account from your vault</p>
                <p className="mt-0.5 text-[12px] text-[color:var(--muted)]">
                  One hop, one consent screen — on Geena&apos;s page, never ours.
                </p>
              </div>
              <GeenaButton demo="vinst" returnTo="/register" label="Continue with Geena" />
            </div>
          )}

          {managing && (
            <>
              {/* Set like a statement: each section opens on a rule, the account closes over a
                  double rule, the way audited documents mark their totals. Every row is live —
                  empty rows fill in place, filled rows open into an update. */}
              <div className="space-y-7 pt-2">
                {sections.map((section, sectionIndex) => (
                  <section key={section.title} className="ledger-open pt-3">
                    <div className="flex items-baseline justify-between">
                      <h2 className="text-[13px] font-semibold tracking-tight">{section.title}</h2>
                      <span className="vault-value text-[10px] text-[color:var(--muted)]">
                        {String(sectionIndex + 1).padStart(2, '0')} /{' '}
                        {String(sections.length).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {section.rows.map((row) => {
                        const slot = slotByTarget(slots, row.target);
                        const record = slot?.records?.find((r) => r.type === 'document');
                        const editing = openTarget === row.target;
                        const pendingFill = !!slot && !record && slot.status === 'pending';
                        const delay = row.value ? `${fieldIndex++ * 120}ms` : undefined;
                        return (
                          <div
                            key={row.label}
                            className={section.rows.length === 1 ? 'sm:col-span-2' : ''}
                          >
                            <div className="flex items-baseline justify-between">
                              <p className="field-label">{row.label}</p>
                              {record && (
                                <button
                                  onClick={() => setOpenTarget(editing ? null : row.target)}
                                  className="text-[10px] font-semibold hover:opacity-70"
                                  style={{ color: 'var(--accent)' }}
                                >
                                  {editing ? 'close' : 'update'}
                                </button>
                              )}
                            </div>
                            {pendingFill ? (
                              <div className="mt-1 rounded-lg border border-[color:var(--line)] bg-[color:var(--card)] px-3 py-2.5">
                                <SlotFiller
                                  bare
                                  demo="vinst"
                                  slot={slot}
                                  onFilled={() => void refresh()}
                                />
                              </div>
                            ) : (
                              <>
                                <div
                                  key={row.value || 'empty'}
                                  className={`mt-1 min-h-10 rounded-lg border border-[color:var(--line)] bg-[color:var(--card)] px-3 py-2.5 text-[13.5px] ${
                                    row.value ? 'fill-in vault-value' : 'text-[color:var(--muted)]'
                                  }`}
                                  style={delay ? { animationDelay: delay } : undefined}
                                >
                                  {row.value || 'Waiting for your vault'}
                                </div>
                                {editing && record && slot && (
                                  <div className="mt-2 rounded-lg border border-[color:var(--line)] bg-[color:var(--card)] px-3 py-2.5">
                                    <SlotFiller
                                      bare
                                      demo="vinst"
                                      slot={slot}
                                      current={(record.data ?? {}) as Record<string, unknown>}
                                      onFilled={() => {
                                        setOpenTarget(null);
                                        void refresh();
                                      }}
                                    />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}

                <div className="ledger-close flex items-baseline justify-between pb-2.5 pt-1">
                  <span className="text-[13px] font-semibold">Account data</span>
                  <span className="vault-value text-[12px]">
                    {completedSections} / {sections.length} sections live
                  </span>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-[color:var(--muted)]">
                Every value above is read live from your vault. Update it here or in Geena — either
                way, Vinst sees the current version on its next read, and every read is receipted on
                your side.
              </p>
            </>
          )}

          {managing && (
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
      </section>

      <aside className="h-fit space-y-4">
        <div className="card p-5">
          <p className="eyebrow">How this works</p>
          <ol className="mt-3 space-y-3 text-[13px] leading-relaxed">
            {[
              [
                'Connect',
                'One hop to Geena — sign in or sign up there. Vinst never sees a password or a code.',
              ],
              [
                'Consent',
                'One screen lists exactly what Vinst asks for, and why. You choose item by item.',
              ],
              [
                'Manage',
                'The account fills itself and stays current: update any value in place, and Vinst reads the new version.',
              ],
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
            Identity and tax residency are required under KYC/AML rules; the payout account is where
            withdrawals go. The consent screen states the legal basis and the retention period — the
            same facts, shown to you before anything moves.
          </p>
        </div>
      </aside>
    </main>
  );
}
