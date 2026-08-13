'use client';

import { useEffect, useMemo, useState } from 'react';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';
import { addressLines, docData, fullName } from '@/lib/records';
import { useDemoBase, useGeena } from '@/lib/use-geena';
import { PRODUCTS, readCart, writeCart } from '../products';

/**
 * The money shot: a checkout with exactly one control that matters. First visit runs the hop to
 * Geena (sign in or sign up THERE, accept the ask, pick what to share); the fields then arrive
 * one by one. Return visits: the hop bounces straight back — consent is skipped for an active
 * connection — and everything is simply here, current version, every time.
 */
export default function BlommaCheckout() {
  const base = useDemoBase('blomma');
  const { data, refresh } = useGeena('blomma');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [ordered, setOrdered] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    setCart(readCart());
    const params = new URLSearchParams(window.location.search);
    if (params.get('denied')) setDenied(true);
  }, []);

  const lines = useMemo(
    () =>
      PRODUCTS.filter((p) => cart[p.id]).map((p) => ({ ...p, quantity: cart[p.id] })),
    [cart]
  );
  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const slots = data?.slots;
  const name = fullName(docData(slots, 'PersonFullName'));
  const email = String(docData(slots, 'PersonEmail')?.email ?? '');
  const phone = String(docData(slots, 'PersonPhone')?.telephone ?? '');
  const address = addressLines(docData(slots, 'PersonAddress'));

  const connected = data?.connected ?? false;
  const anythingGranted = !!(name || email || phone || address.length);
  const waitingOnGrants = connected && !data?.accessEnded && !anythingGranted;

  const fields: { label: string; value: string }[] = [
    { label: 'Full name', value: name },
    { label: 'Email', value: email },
    { label: 'Phone', value: phone },
    { label: 'Delivery address', value: address.join(' · ') },
  ];

  const placeOrder = () => {
    setOrdered(true);
    setCart({});
    writeCart({});
  };

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-6 pb-10 lg:grid-cols-[1fr_20rem]">
      <section>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Checkout</h1>

        {ordered ? (
          <div className="mt-6 rounded-3xl bg-[color:var(--card)] p-8 text-center shadow-sm ring-1 ring-[color:var(--line)]">
            <div className="text-5xl">💐</div>
            <h2 className="font-display mt-3 text-2xl font-semibold">On its way{name ? `, ${name.split(' ')[0]}` : ''}.</h2>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-[color:var(--muted)]">
              Payment simulated — this is a demo. The delivery details came from your vault and
              were never stored by Blomma: next time, they will simply arrive again, current.
            </p>
            <a href={`${base}/`} className="mt-5 inline-block text-[13px] font-semibold underline underline-offset-4">
              Back to the shop
            </a>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {data && !data.configured && (
              <StateNotice tone="info">{data.configureHint}</StateNotice>
            )}
            {denied && !connected && (
              <StateNotice tone="denied">
                No problem — nothing was shared. You can check out with Geena whenever you like.
              </StateNotice>
            )}

            {data?.accessEnded && (
              <StateNotice tone="ended">
                Access ended: you revoked this connection in your Geena, so Blomma can no longer
                read anything. Reconnect below to fill the form again — nothing survived on
                Blomma&apos;s side.
              </StateNotice>
            )}

            <div className="rounded-3xl bg-[color:var(--card)] p-6 shadow-sm ring-1 ring-[color:var(--line)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold">Delivery details</h2>
                {!connected || data?.accessEnded ? (
                  <GeenaButton demo="blomma" returnTo="/checkout" label="Fill with Geena" />
                ) : (
                  <span className="text-[11px] font-medium text-[color:var(--muted)]">
                    filled from your vault — current version, every visit
                  </span>
                )}
              </div>

              {waitingOnGrants && (
                <div className="mt-4">
                  <StateNotice tone="info">
                    You&apos;re connected — now choose what to share.{' '}
                    {data?.grantUrl && (
                      <a
                        href={data.grantUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold underline underline-offset-2"
                      >
                        Open the request in your Geena
                      </a>
                    )}{' '}
                    and this page will fill itself the moment you grant.
                  </StateNotice>
                </div>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {fields.map((field, index) => (
                  <label key={field.label} className={field.label === 'Delivery address' ? 'sm:col-span-2' : ''}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--muted)]">
                      {field.label}
                    </span>
                    <div
                      key={field.value || 'empty'}
                      className={`mt-1 min-h-10 rounded-xl border border-[color:var(--line)] bg-white/60 px-3 py-2 text-[14px] ${
                        field.value ? 'fill-in font-medium' : 'text-[color:var(--muted)]'
                      }`}
                      style={field.value ? { animationDelay: `${index * 120}ms` } : undefined}
                    >
                      {field.value || '—'}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={!anythingGranted || lines.length === 0}
              className="w-full rounded-2xl bg-[color:var(--ink)] px-6 py-4 text-[15px] font-semibold text-white transition-opacity disabled:opacity-40"
            >
              Place order · €{total} <span className="font-normal opacity-70">(payment simulated)</span>
            </button>

            {connected && !data?.accessEnded && (
              <p className="text-center text-[11px] text-[color:var(--muted)]">
                Done here?{' '}
                <button
                  onClick={async () => {
                    await fetch('/api/revoke?demo=blomma', { method: 'POST' });
                    void refresh();
                  }}
                  className="underline underline-offset-2 hover:opacity-70"
                >
                  Disconnect Geena
                </button>{' '}
                — Blomma keeps nothing.
              </p>
            )}
          </div>
        )}
      </section>

      <aside className="h-fit rounded-3xl bg-[color:var(--card)] p-5 shadow-sm ring-1 ring-[color:var(--line)]">
        <h2 className="font-display text-lg font-semibold">Your basket</h2>
        {lines.length === 0 && !ordered ? (
          <p className="mt-2 text-[13px] text-[color:var(--muted)]">
            Empty — <a href={`${base}/`} className="underline underline-offset-2">pick a bouquet</a> first.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-[13px]">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center justify-between gap-2">
                <span>
                  {line.emoji} {line.name} × {line.quantity}
                </span>
                <span className="font-semibold">€{line.price * line.quantity}</span>
              </li>
            ))}
            <li className="flex items-center justify-between border-t border-[color:var(--line)] pt-2 font-semibold">
              <span>Total</span>
              <span>€{total}</span>
            </li>
          </ul>
        )}
      </aside>
    </main>
  );
}
