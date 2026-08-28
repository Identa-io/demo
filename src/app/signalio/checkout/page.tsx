'use client';

import { useEffect, useState } from 'react';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';
import { SlotFiller } from '@/components/slot-filler';
import { addressLines, docData, fullName, maskedAccount, slotByTarget } from '@/lib/records';
import { useDemoBase, useGeena } from '@/lib/use-geena';

/**
 * Signalio — screen 2 of 3, the form stage, cut to the bone per the design: one card of
 * subscriber details resolving from the vault, one order ticket. The chapter's entire point is
 * what this page is NOT — there is nothing to type, so there is almost nothing on it.
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

  let fieldIndex = 0;

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_1fr]">
      <section>
        <p className="eyebrow">Checkout</p>
        <h1 className="font-display mt-2 text-[30px] font-bold tracking-tight">
          Start your subscription.
        </h1>

        <div className="mt-6 flex flex-col gap-4">
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
              <h2 className="text-[13px] font-semibold">Subscriber details</h2>
              <div className="mt-3 flex flex-col gap-3">
                {rows.map((row) => {
                  const slot = slotByTarget(slots, row.target);
                  const pendingFill = !!slot && slot.status === 'pending';
                  const delay = row.value ? `${fieldIndex++ * 120}ms` : undefined;
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
                          style={delay ? { animationDelay: delay } : undefined}
                        >
                          {row.value || 'Waiting for your vault'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="sticky top-6 flex h-fit flex-col gap-4 lg:mt-[85px]">
        <div className="card p-6">
          <p className="eyebrow">Your order</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-[15px] font-bold">Signalio Core</span>
            <span className="tabular text-[15px] font-bold">€12.00/mo</span>
          </div>
          <p className="mt-1 text-[12px] text-[color:var(--muted)]">
            The Morning Signal, weekdays 07:00 · SEPA direct debit · cancel anytime
          </p>
          <a
            href={complete ? `${base}/done` : undefined}
            aria-disabled={!complete}
            className={`btn-primary mt-5 w-full !py-3 !text-[14px] ${
              complete ? '' : 'pointer-events-none opacity-40'
            }`}
          >
            {complete ? 'Start my subscription →' : 'Waiting for your vault…'}
          </a>
          {managing && (
            <button
              onClick={async () => {
                await fetch('/api/revoke?demo=signalio', { method: 'POST' });
                void refresh();
              }}
              className="btn-secondary mt-2.5 w-full !py-3 !text-[14px]"
            >
              Disconnect Geena
            </button>
          )}
        </div>
      </aside>
    </main>
  );
}
