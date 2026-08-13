'use client';

import { useState } from 'react';
import { StateNotice } from '@/components/demo-chrome';
import { useDemoBase, useGeena } from '@/lib/use-geena';
import { LISTINGS } from './listings';

/**
 * Nyckel's listings. Applying requires being signed in — and signing in IS the Geena hop; there
 * is no password anywhere on this platform. An application shares employment, income and salary
 * slips from the vault: no PDFs over email, no copies floating around.
 */
export default function NyckelListings() {
  const base = useDemoBase('nyckel');
  const { data, refresh } = useGeena('nyckel');
  const [busy, setBusy] = useState<string | null>(null);

  const authed = !!data?.nyckelAuthed && !!data?.connected;
  const applications = data?.applications ?? [];

  const apply = async (listingId: string) => {
    setBusy(listingId);
    try {
      await fetch('/api/nyckel/apply', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6">
      <section className="py-12">
        <h1 className="font-display max-w-2xl text-4xl font-light leading-[1.15] tracking-tight">
          Homes for people, <span className="font-semibold">not paperwork.</span>
        </h1>
        <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-[color:var(--muted)]">
          Apply with your vault: employment, income and salary slips arrive with your consent —
          and leave when you take them back.
        </p>
      </section>

      <section className="grid gap-6 pb-4 md:grid-cols-3">
        {LISTINGS.map((listing) => {
          const applied = applications.includes(listing.id);
          return (
            <article key={listing.id} className="group">
              <div className="h-44 rounded-2xl" style={{ background: listing.art }} aria-hidden />
              <div className="mt-3 flex items-baseline justify-between">
                <h2 className="font-display text-lg font-semibold">{listing.title}</h2>
                <span className="text-[14px] font-semibold">€{listing.rent}/mo</span>
              </div>
              <p className="text-[12px] text-[color:var(--muted)]">
                {listing.area} · {listing.rooms} rooms · {listing.size} m²
              </p>
              {applied ? (
                <a
                  href={`${base}/account`}
                  className="mt-3 inline-block w-full rounded-xl border border-[color:var(--ink)] px-4 py-2 text-center text-[13px] font-semibold"
                >
                  Application submitted →
                </a>
              ) : authed ? (
                <button
                  onClick={() => apply(listing.id)}
                  disabled={busy === listing.id}
                  className="mt-3 w-full rounded-xl bg-[color:var(--ink)] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
                >
                  {busy === listing.id ? 'Applying…' : 'Apply'}
                </button>
              ) : (
                <a
                  href={`${base}/login`}
                  className="mt-3 inline-block w-full rounded-xl bg-[color:var(--ink)] px-4 py-2 text-center text-[13px] font-semibold text-white"
                >
                  Sign in to apply
                </a>
              )}
            </article>
          );
        })}
      </section>

      {data && !data.configured && (
        <StateNotice tone="info">{data.configureHint}</StateNotice>
      )}

      {authed && (
        <StateNotice tone="info">
          Signed in with Geena — no password ever existed here. Your applications live under{' '}
          <a href={`${base}/account`} className="font-semibold underline underline-offset-2">
            Account
          </a>
          .
        </StateNotice>
      )}
    </main>
  );
}
