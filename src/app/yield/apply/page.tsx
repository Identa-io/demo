'use client';

import { useEffect, useState } from 'react';
import type { DataSlot } from '@/app/api/data/route';
import { BulkSlotFields } from '@/components/bulk-fill-fields';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';
import { SCHEMA_FIELDS } from '@/lib/schema-fields';
import { slotByTarget } from '@/lib/records';
import { useBulkFill } from '@/lib/use-bulk-fill';
import { useDemoBase, useGeena } from '@/lib/use-geena';
import { YieldHeader } from '../header';

/**
 * Yield — screen 2 of 3, the form stage, set as one engraved application: every field is an
 * ordinary aligned input, prefilled from the vault where it can be, and ONE closing act pushes
 * the whole application — no per-data-point confirm buttons. Under the hood each slot still
 * lands as its own consented, receipted write (attach / set / create / update — see
 * useBulkFill); only the choreography is gone.
 */

const SECTIONS: { title: string; targets: string[] }[] = [
  {
    title: 'Identity',
    targets: [
      'PersonFullName',
      'PersonBirthDetails',
      'PersonIdentityDocument',
      'PersonEmail',
      'PersonPhone',
    ],
  },
  { title: 'Residential address', targets: ['PersonAddress'] },
  { title: 'Payout account', targets: ['PersonBankAccount'] },
  { title: 'Tax residency', targets: ['PersonTaxStatus'] },
];

export default function YieldApply() {
  const base = useDemoBase('yield');
  const { data, refresh } = useGeena('yield');
  const [denied, setDenied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDenied(new URLSearchParams(window.location.search).has('denied'));
  }, []);

  const slots = data?.slots;
  const connected = data?.connected ?? false;
  const managing = connected && !data?.accessEnded;

  const form = useBulkFill('yield', managing ? slots : undefined);
  const { submitAll, busy, errors, slotReady, slotComplete } = form;

  const sectionSlots = SECTIONS.map((section) => ({
    ...section,
    slots: section.targets
      .map((target) => slotByTarget(slots, target))
      .filter((slot): slot is DataSlot => !!slot),
  }));
  const allSlots = sectionSlots.flatMap((section) => section.slots);
  const readySlots = allSlots.filter((slot) => slotReady(slot));
  const completeCount = allSlots.filter((slot) => slotReady(slot) && slotComplete(slot)).length;
  const allComplete = allSlots.length > 0 && completeCount === allSlots.length;
  const loading = managing && (allSlots.length === 0 || readySlots.length < allSlots.length);
  const failedCount = Object.keys(errors).length;

  const submit = async () => {
    setSubmitting(true);
    const ok = await submitAll();
    if (ok) {
      window.location.href = `${base}/done`;
      return;
    }
    setSubmitting(false);
    void refresh();
  };

  return (
    <>
      <YieldHeader variant="centered" />
      <main className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-12 lg:grid-cols-[1fr_19rem]">
        <section>
          <p className="eyebrow">Account application</p>
          <h1 className="font-display mt-2.5 text-[38px] font-semibold">Open your account</h1>
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

            {managing && loading && (
              <p className="text-[13px] italic text-[color:var(--muted)]">
                Reading your vault…
              </p>
            )}

            {managing && !loading && (
              <>
                <div className="flex flex-col gap-7 pt-2">
                  {sectionSlots.map((section, sectionIndex) => (
                    <section key={section.title} className="ledger-open pt-3">
                      <div className="flex items-baseline justify-between">
                        <h2 className="font-display text-[19px] font-semibold">{section.title}</h2>
                        <span className="font-mono text-[10px] text-[color:var(--gold)]">
                          {String(sectionIndex + 1).padStart(2, '0')} /{' '}
                          {String(sectionSlots.length).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-x-5 gap-y-3.5 sm:grid-cols-2">
                        {section.slots.map((slot) => {
                          const wide = (SCHEMA_FIELDS[slot.target!] ?? []).length > 2;
                          return (
                            <div key={slot.slotId} className={wide ? 'sm:col-span-2' : ''}>
                              <p className="field-label">{slot.label ?? slot.target}</p>
                              <div className="mt-1.5">
                                <BulkSlotFields slot={slot} form={form} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))}

                  <div className="ledger-close flex items-baseline justify-between pb-2.5 pt-1">
                    <span className="font-display text-[17px] font-semibold">Application</span>
                    <span className="font-mono text-[12px]">
                      {completeCount} / {allSlots.length} ready
                    </span>
                  </div>
                </div>

                {failedCount > 0 && (
                  <StateNotice tone="denied">
                    {failedCount} of {allSlots.length} data points did not land — the details are
                    under the fields. Fix and submit again; what already landed stays shared.
                  </StateNotice>
                )}

                <div className="flex flex-col items-end gap-2">
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
                    <button
                      onClick={() => void submit()}
                      disabled={!allComplete || busy || submitting}
                      className="inline-flex items-center gap-2 px-6 py-3 text-[13.5px] font-semibold text-[#f5f3ea] transition-opacity hover:opacity-90 disabled:opacity-40"
                      style={{ background: 'var(--cta)', fontFamily: 'var(--font-inter)' }}
                    >
                      {busy || submitting
                        ? 'Writing to your vault…'
                        : allComplete
                          ? 'Open my account →'
                          : `Complete ${allSlots.length - completeCount} more`}
                    </button>
                  </div>
                  <p className="max-w-md text-right text-[11px] leading-relaxed text-[color:var(--muted)]">
                    One act shares the whole application: values already in your vault are handed
                    over as they are, everything you typed or corrected is written to your vault
                    first — then Yield reads it. Each data point still lands as its own receipted
                    share.
                  </p>
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
                  'The form arrives prefilled from your vault. Whatever you type or correct is written into YOUR vault when you submit — the last time you ever type it.',
                ],
                [
                  'Stay current',
                  'Update any value here later, and Yield reads the new version. So will chapters 2 and 3 — without asking you to type at all.',
                ],
              ].map(([title, text], index) => (
                <li key={title} className="flex gap-3">
                  <span
                    className="font-mono flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-[color:var(--accent-ink)]"
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
