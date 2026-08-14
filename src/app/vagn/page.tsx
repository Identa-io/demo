'use client';

import { useState } from 'react';
import { StateNotice } from '@/components/demo-chrome';
import { useDemoBase, useGeena } from '@/lib/use-geena';
import { FLEET } from './fleet';

/**
 * Vagn's fleet. Reserving requires being signed in — and signing in IS the Geena hop; there is
 * no password anywhere on this platform. The rental profile (driver details, home address, the
 * licence) arrives from the vault with consent, and leaves when it is taken back.
 */
export default function VagnFleet() {
  const base = useDemoBase('vagn');
  const { data, refresh } = useGeena('vagn');
  const [busy, setBusy] = useState<string | null>(null);

  const authed = !!data?.vagnAuthed && !!data?.connected;
  const bookings = data?.bookings ?? [];

  const reserve = async (carId: string) => {
    setBusy(carId);
    try {
      await fetch('/api/vagn/book', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ carId }),
      });
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <main>
      <section className="border-b border-[color:var(--line)] bg-[color:var(--card)]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="eyebrow">Malmö · Kastrup · Göteborg</p>
          <h1 className="font-display mt-3 max-w-2xl text-[40px] font-bold leading-[1.08] tracking-tight">
            The keys, without the counter queue.
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-[color:var(--muted)]">
            Your driver profile and licence live in your vault. Sign in once — no password, no forms
            at the desk — and the car is ready under your name.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {data && !data.configured && (
          <div className="mb-5">
            <StateNotice tone="info">{data.configureHint}</StateNotice>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-3">
          {FLEET.map((car) => {
            const reserved = bookings.includes(car.id);
            return (
              <article key={car.id} className="card overflow-hidden">
                <div
                  className="relative flex h-36 items-end justify-between p-4"
                  style={{ background: 'linear-gradient(160deg, #212430, #15171c)' }}
                >
                  <span className="font-display text-5xl font-bold uppercase text-white/15">
                    {car.name}
                  </span>
                  {car.badge && (
                    <span
                      className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
                    >
                      {car.badge}
                    </span>
                  )}
                  {/* A restrained road mark, not a clip-art car. */}
                  <svg
                    viewBox="0 0 120 24"
                    className="absolute bottom-3 left-4 w-24 opacity-40"
                    aria-hidden
                  >
                    <line
                      x1="0"
                      y1="12"
                      x2="120"
                      y2="12"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeDasharray="14 10"
                    />
                  </svg>
                </div>
                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <h2 className="text-[16px] font-bold">{car.name}</h2>
                      <p className="text-[12px] text-[color:var(--muted)]">{car.example}</p>
                    </div>
                    <p className="tabular text-right">
                      <span className="text-[18px] font-bold">€{car.perDay}</span>
                      <span className="text-[11px] text-[color:var(--muted)]">/day</span>
                    </p>
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-[color:var(--line)] pt-3 text-center text-[11px] text-[color:var(--muted)]">
                    <div>
                      <dt className="sr-only">Seats</dt>
                      <dd>{car.seats} seats</dd>
                    </div>
                    <div>
                      <dt className="sr-only">Gearbox</dt>
                      <dd>{car.gearbox}</dd>
                    </div>
                    <div className="truncate" title={car.drive}>
                      <dt className="sr-only">Drive</dt>
                      <dd>{car.drive.split(' · ')[0]}</dd>
                    </div>
                  </dl>
                  {reserved ? (
                    <a href={`${base}/account`} className="btn-secondary mt-4 w-full">
                      Reserved — view booking
                    </a>
                  ) : authed ? (
                    <button
                      onClick={() => reserve(car.id)}
                      disabled={busy === car.id}
                      className="btn-primary mt-4 w-full"
                    >
                      {busy === car.id ? 'Reserving…' : 'Reserve'}
                    </button>
                  ) : (
                    <a href={`${base}/login`} className="btn-primary mt-4 w-full">
                      Sign in to reserve
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-6 text-center text-[11px] text-[color:var(--muted)]">
          Free cancellation until pick-up · unlimited mileage · prices illustrative, Vagn is a
          fictional brand.
        </p>
      </section>
    </main>
  );
}
