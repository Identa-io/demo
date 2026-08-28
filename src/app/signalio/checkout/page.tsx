'use client';

import { useEffect, useState } from 'react';
import { BulkSlotFields } from '@/components/bulk-fill-fields';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';
import { slotByTarget } from '@/lib/records';
import { useBulkFill } from '@/lib/use-bulk-fill';
import { useDemoBase, useGeena } from '@/lib/use-geena';

const TARGETS = [
  { label: 'Name', target: 'PersonFullName' },
  { label: 'Email', target: 'PersonEmail' },
  { label: 'Billing address', target: 'PersonAddress' },
  { label: 'SEPA account', target: 'PersonBankAccount' },
];

/**
 * Signalio — screen 2 of 3, the form stage. The chapter's entire point is what this page is
 * NOT: the four asks arrive prefilled from the vault (chips propose reuse when there is a
 * choice), and ONE act — "Start my subscription" — pushes them all and starts the product.
 * Nothing to type, nothing to confirm per data point.
 */
export default function SignalioCheckout() {
  const base = useDemoBase('signalio');
  const { data, refresh } = useGeena('signalio');
  const [denied, setDenied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDenied(new URLSearchParams(window.location.search).has('denied'));
  }, []);

  const slots = data?.slots;
  const connected = data?.connected ?? false;
  const managing = connected && !data?.accessEnded;

  const form = useBulkFill('signalio', managing ? slots : undefined);

  const rows = TARGETS.map((row) => ({ ...row, slot: slotByTarget(slots, row.target) }));
  const present = rows.filter((row) => !!row.slot);
  const readyCount = present.filter((row) => form.slotReady(row.slot!)).length;
  const completeCount = present.filter(
    (row) => form.slotReady(row.slot!) && form.slotComplete(row.slot!),
  ).length;
  const loading = managing && (present.length === 0 || readyCount < present.length);
  const complete = managing && !loading && completeCount === present.length;
  const failedCount = Object.keys(form.errors).length;

  const submit = async () => {
    setSubmitting(true);
    const ok = await form.submitAll();
    if (ok) {
      window.location.href = `${base}/done`;
      return;
    }
    setSubmitting(false);
    void refresh();
  };

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
              <div className="flex items-baseline justify-between">
                <h2 className="text-[13px] font-semibold">Subscriber details</h2>
                <span className="vault-value text-[10px] text-[color:var(--muted)]">
                  {loading ? 'reading your vault…' : `${completeCount} / ${present.length} from your vault`}
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                {present.map(({ label, slot }) => (
                  <div key={slot!.slotId}>
                    <p className="field-label">{label}</p>
                    <div className="mt-1">
                      <BulkSlotFields slot={slot!} form={form} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-[color:var(--muted)]">
                Everything above came from your vault — correct it once here, and every connection
                you have reads the new version.
              </p>
            </div>
          )}

          {failedCount > 0 && (
            <StateNotice tone="denied">
              {failedCount} of {present.length} data points did not land — the details are under
              the fields. Fix and start again; what already landed stays shared.
            </StateNotice>
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
          <button
            onClick={() => void submit()}
            disabled={!complete || form.busy || submitting}
            className="btn-primary mt-5 w-full !py-3 !text-[14px]"
          >
            {form.busy || submitting
              ? 'Sharing from your vault…'
              : complete
                ? 'Start my subscription →'
                : 'Waiting for your vault…'}
          </button>
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
          <p className="mt-3 text-[10px] leading-relaxed text-[color:var(--muted)]">
            One act shares all four data points and starts the subscription. Each still lands as
            its own receipted share in your Geena.
          </p>
        </div>
      </aside>
    </main>
  );
}
