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
  maskedDocument,
  slotByTarget,
  taxResidency,
} from '@/lib/records';
import { useDemoBase, useGeena } from '@/lib/use-geena';
import { YieldHeader } from '../header';

/**
 * Yield — screen 2 of 3, the form stage, set as an engraved statement: Cormorant section heads,
 * Plex Mono values in square paper boxes, sections opening on hairlines and the application
 * closing over a double rule. Every keystroke lands in the visitor's vault, not in Yield's
 * database; a filled row opens into an update that writes back through the delegated-write path.
 */
export default function YieldApply() {
  const base = useDemoBase('yield');
  const { data, refresh } = useGeena('yield');
  const [denied, setDenied] = useState(false);
  const [openTarget, setOpenTarget] = useState<string | null>(null);

  useEffect(() => {
    setDenied(new URLSearchParams(window.location.search).has('denied'));
  }, []);

  const slots = data?.slots;
  const name = fullName(docData(slots, 'PersonFullName'));
  const birth = String(docData(slots, 'PersonBirthDetails')?.dateOfBirth ?? '');
  const idDoc = maskedDocument(docData(slots, 'PersonIdentityDocument'));
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
        { label: 'Date of birth', target: 'PersonBirthDetails', value: birth },
        { label: 'Identity document', target: 'PersonIdentityDocument', value: idDoc },
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
      rows: [{ label: 'IBAN', target: 'PersonBankAccount', value: payout }],
    },
    {
      title: 'Tax residency',
      rows: [{ label: 'Residency', target: 'PersonTaxStatus', value: tax }],
    },
  ];

  const allRows = sections.flatMap((section) => section.rows);
  const providedRows = allRows.filter((row) => row.value).length;
  const complete = managing && providedRows === allRows.length;

  let fieldIndex = 0;

  return (
    <>
      <YieldHeader variant="centered" />
      <main className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-12 lg:grid-cols-[1fr_19rem]">
        <section>
          <p className="eyebrow">Account application</p>
          <h1 className="font-display mt-2.5 text-[38px] font-semibold">
            {name ? name : 'Open your account'}
          </h1>
          <p className="mt-2.5 max-w-lg text-[13.5px] leading-[1.7] text-[color:var(--muted)]">
            Regulation says we must hold current data on who you are, where you pay tax, and where
            withdrawals go. It does not say you have to retype it when life changes — or ever
            again, anywhere.
          </p>

          <div className="mt-7 flex flex-col gap-4">
            {data && !data.configured && <StateNotice tone="info">{data.configureHint}</StateNotice>}

            {denied && !connected && (
              <StateNotice tone="denied">
                Nothing was shared — the application stays empty until you decide otherwise.
              </StateNotice>
            )}

            {data?.accessEnded && (
              <StateNotice tone="ended">
                Access ended: you revoked Yield in your Geena, so this application can no longer
                read anything. Reconnect to continue — nothing survived on Yield&apos;s side.
              </StateNotice>
            )}

            {(!connected || data?.accessEnded) && (
              <div className="flex flex-col items-start justify-between gap-4 border border-[color:var(--line)] bg-[color:var(--card)] p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[14.5px] font-semibold">Open your account from your vault</p>
                  <p className="mt-0.5 text-[12.5px] text-[color:var(--muted)]">
                    One hop, one consent screen — on Geena&apos;s page, never ours.
                  </p>
                </div>
                <GeenaButton demo="yield" returnTo="/apply" label="Connect with Geena" />
              </div>
            )}

            {managing && (
              <>
                <div className="flex flex-col gap-7 pt-2">
                  {sections.map((section, sectionIndex) => (
                    <section key={section.title} className="ledger-open pt-3">
                      <div className="flex items-baseline justify-between">
                        <h2 className="font-display text-[19px] font-semibold">{section.title}</h2>
                        <span className="font-mono text-[10px] text-[color:var(--gold)]">
                          {String(sectionIndex + 1).padStart(2, '0')} /{' '}
                          {String(sections.length).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
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
                                    className="text-[9.5px] font-semibold uppercase tracking-[0.14em] underline underline-offset-[3px] hover:opacity-70"
                                  >
                                    {editing ? 'Close' : 'Update'}
                                  </button>
                                )}
                              </div>
                              {pendingFill ? (
                                <div className="mt-1.5 border border-[color:var(--line)] bg-[color:var(--card)] px-3 py-2.5">
                                  <SlotFiller
                                    bare
                                    demo="yield"
                                    slot={slot}
                                    onFilled={() => void refresh()}
                                  />
                                </div>
                              ) : (
                                <>
                                  <div
                                    key={row.value || 'empty'}
                                    className={`mt-1.5 min-h-10 border border-[color:var(--line)] bg-[color:var(--card)] px-3 py-2.5 ${
                                      row.value
                                        ? 'fill-in font-mono tabular text-[13px]'
                                        : 'text-[13px] italic text-[color:var(--muted)]'
                                    }`}
                                    style={delay ? { animationDelay: delay } : undefined}
                                  >
                                    {row.value || 'Waiting for your vault'}
                                  </div>
                                  {editing && record && slot && (
                                    <div className="mt-2 border border-[color:var(--line)] bg-[color:var(--card)] px-3 py-2.5">
                                      <SlotFiller
                                        bare
                                        demo="yield"
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
                    <span className="font-display text-[17px] font-semibold">Application</span>
                    <span className="font-mono text-[12px]">
                      {providedRows} / {allRows.length} provided
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={async () => {
                      await fetch('/api/revoke?demo=yield', { method: 'POST' });
                      void refresh();
                    }}
                    className="border border-[color:var(--line)] px-5 py-3 text-[13.5px] font-semibold text-[color:var(--muted)] transition-opacity hover:opacity-75"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    Disconnect Geena
                  </button>
                  <a
                    href={complete ? `${base}/done` : undefined}
                    aria-disabled={!complete}
                    className={`inline-flex items-center gap-2 px-6 py-3 text-[13.5px] font-semibold text-[#f5f3ea] transition-opacity hover:opacity-90 ${
                      complete ? '' : 'pointer-events-none opacity-40'
                    }`}
                    style={{ background: 'var(--cta)', fontFamily: 'var(--font-inter)' }}
                  >
                    {complete
                      ? 'Open my account →'
                      : `Provide ${allRows.length - providedRows} more`}
                  </a>
                </div>
              </>
            )}
          </div>
        </section>

        <aside className="flex h-fit flex-col gap-4">
          <div className="border border-[color:var(--line)] bg-[color:var(--card)] p-[22px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--gold)]">
              How this works
            </p>
            <ol className="mt-3.5 flex flex-col gap-3.5 text-[13px] leading-[1.65]">
              {[
                [
                  'Connect',
                  'One hop to Geena — sign in or sign up there. Yield never sees a password or a code.',
                ],
                [
                  'Fill once',
                  'Every field you type here is written into YOUR vault and shared in the same act — the last time you ever type it.',
                ],
                [
                  'Stay current',
                  'Update any value in place, and Yield reads the new version. So will chapters 2 and 3 — without asking you to type at all.',
                ],
              ].map(([title, text], index) => (
                <li key={title} className="flex gap-3">
                  <span className="font-mono flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-[color:var(--accent-ink)]" style={{ background: 'var(--ink)' }}>
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
          <div className="border border-[color:var(--line)] bg-[color:var(--card)] p-[22px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--gold)]">
              Why we ask
            </p>
            <p className="mt-2.5 text-[12.5px] leading-[1.7] text-[color:var(--muted)]">
              Identity, an ID document and tax residency are required under EU KYC/AML rules; the
              IBAN is where withdrawals go. The consent screen states the legal basis and the
              retention period — the same facts, shown to you before anything moves.
            </p>
          </div>
        </aside>
      </main>
    </>
  );
}
