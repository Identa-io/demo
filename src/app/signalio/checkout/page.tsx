'use client';

import { useEffect, useState } from 'react';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';
import { SlotFiller } from '@/components/slot-filler';
import { addressLines, docData, fullName, maskedAccount, slotByTarget } from '@/lib/records';
import { useDemoBase, useGeena } from '@/lib/use-geena';

/**
 * Signalio — screen 2 of 3, the form stage. The chapter's entire point is what this form is
 * NOT: there is nothing to type. Every ask resolves from the vault — singleton forms arrive
 * prefilled ("Confirm & share"), instances are a one-tap pick. The counter keeps the score
 * honest: fields typed stays at zero.
 */
export default function SignalioCheckout() {
  const base = useDemoBase('signalio');
  const { data, refresh } = useGeena('signalio');
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    setDenied(new URLSearchParams(window.location.search).has('denied'));
  }, []);

  const slots = data?.slots;
  const rows: { label: string; target: string; value: string }[] = [
    { label: 'Name', target: 'PersonFullName', value: fullName(docData(slots, 'PersonFullName')) },
    { label: 'Email', target: 'PersonEmail', value: String(docData(slots, 'PersonEmail')?.email ?? '') },
    {
      label: 'Billing address',
      target: 'PersonAddress',
      value: addressLines(docData(slots, 'PersonAddress')).join(' · '),
    },
    {
      label: 'SEPA account',
      target: 'PersonBankAccount',
      value: maskedAccount(docData(slots, 'PersonBankAccount')),
    },
  ];

  const connected = data?.connected ?? false;
  const managing = connected && !data?.accessEnded;
  const provided = rows.filter((row) => row.value).length;
  const complete = managing && provided === rows.length;

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_1fr]">
      <section>
        <p className="eyebrow">Checkout</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight">
          Start your subscription.
        </h1>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[color:var(--muted)]">
          Four data points, all of them already in your vault. Notice what you are{' '}
          <em>not</em> doing on this page.
        </p>

        <div className="mt-6 space-y-4">
          {data && !data.configured && <StateNotice tone="info">{data.configureHint}</StateNotice>}

          {denied && !connected && (
            <StateNotice tone="denied">
              Nothing was shared — no subscription starts until you decide otherwise.
            </StateNotice>
          )}

          {data?.accessEnded && (
            <StateNotice tone="ended">
              Access ended — you revoked Signalio in your Geena. The subscription lost its data
              source, which is exactly what cancelling should mean.
            </StateNotice>
          )}

          {(!connected || data?.accessEnded) && (
            <div className="card flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-[14px] font-semibold">Connect to fill the order from your vault</p>
                <p className="mt-0.5 text-[12px] text-[color:var(--muted)]">
                  One hop, one consent screen — and everything below resolves by itself.
                </p>
              </div>
              <GeenaButton demo="signalio" returnTo="/checkout" label="Connect with Geena" />
            </div>
          )}

          {managing && (
            <div className="card p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[13px] font-semibold">Subscriber details</h2>
                <span className="vault-value text-[10px] text-[color:var(--muted)]">
                  {provided} / {rows.length} from your vault
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {rows.map((row) => {
                  const slot = slotByTarget(slots, row.target);
                  const pendingFill = !!slot && slot.status === 'pending';
                  return (
                    <div key={row.label}>
                      <p className="field-label">{row.label}</p>
                      {pendingFill ? (
                        <div className="mt-1 rounded-lg border border-[color:var(--line)] bg-[color:var(--card)] px-3 py-2.5">
                          <SlotFiller
                            bare
                            demo="signalio"
                            slot={slot}
                            onFilled={() => void refresh()}
                          />
                        </div>
                      ) : (
                        <div
                          key={row.value || 'empty'}
                          className={`mt-1 min-h-10 rounded-lg border border-[color:var(--line)] bg-[color:var(--card)] px-3 py-2.5 text-[13.5px] ${
                            row.value ? 'fill-in vault-value' : 'text-[color:var(--muted)]'
                          }`}
                        >
                          {row.value || 'Waiting for your vault'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-[color:var(--muted)]">
                A pick or a confirm is a consented, receipted act — not typing. If a value looks
                stale, correct it once; every connection you have reads the new version.
              </p>
            </div>
          )}

          {managing && (
            <p className="text-center text-[11px] text-[color:var(--muted)]">
              Changed your mind?{' '}
              <button
                onClick={async () => {
                  await fetch('/api/revoke?demo=signalio', { method: 'POST' });
                  void refresh();
                }}
                className="underline underline-offset-2 hover:opacity-70"
              >
                Disconnect Geena
              </button>{' '}
              — Signalio keeps nothing.
            </p>
          )}
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-6 h-fit">
        <div className="card p-6">
          <p className="eyebrow">Your order</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-[15px] font-bold">Signalio Core</span>
            <span className="tabular text-[15px] font-bold">€12.00/mo</span>
          </div>
          <p className="mt-1 text-[12px] text-[color:var(--muted)]">
            The Morning Signal, weekdays 07:00 · SEPA direct debit · cancel anytime
          </p>
          <div className="mt-5 space-y-2 border-t border-[color:var(--line)] pt-4 text-[12px]">
            {[
              ['Data points asked for', '4'],
              ['Fields you typed', '0'],
              ['Passwords created', '0'],
            ].map(([item, amount]) => (
              <div key={item} className="leader-row">
                <span className="text-[color:var(--muted)]">{item}</span>
                <span className="leader-fill" aria-hidden />
                <span className="tabular font-semibold">{amount}</span>
              </div>
            ))}
          </div>
          <a
            href={complete ? `${base}/done` : undefined}
            aria-disabled={!complete}
            className={`btn-primary mt-5 w-full !py-3 !text-[14px] ${
              complete ? '' : 'pointer-events-none opacity-40'
            }`}
            style={{ background: 'var(--accent)' }}
          >
            {complete ? 'Start my subscription →' : 'Waiting for your vault…'}
          </a>
          <p className="mt-3 text-[10px] leading-relaxed text-[color:var(--muted)]">
            Illustrative pricing. Signalio is fictional; no mandate is signed and no payment
            happens.
          </p>
        </div>

        <div className="card p-5">
          <p className="eyebrow">Why so little?</p>
          <p className="mt-2 text-[12px] leading-relaxed text-[color:var(--muted)]">
            A subscription needs a subscriber, somewhere to deliver, and a way to collect €12 —
            so that is the whole manifest. The small ask is not politeness; on a consent screen,
            over-asking is visible. Minimal manifests convert.
          </p>
        </div>
      </aside>
    </main>
  );
}
