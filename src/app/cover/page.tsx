'use client';

import { GeenaButton } from '@/components/geena-button';

/**
 * Cover — screen 1 of 3, the landing. Chapter 3 of the journey: the new-shapes chapter. The
 * pitch leads with the family (subjects) and the switching discount (the file slot); what the
 * visitor will notice is that their own half of the form no longer exists.
 */
export default function CoverHome() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow">Single-trip cover · family</p>
          <h1 className="font-display mt-3 max-w-xl text-[44px] font-bold leading-[1.06] tracking-tight">
            The whole family, covered in one sitting.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[color:var(--muted)]">
            No &ldquo;traveller 2, date of birth&rdquo; forms. Your children live in your vault —
            you decide which of them this policy covers, each is priced per person, and that is
            all Cover ever learns.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <GeenaButton demo="cover" returnTo="/quote" label="Connect with Geena" size="lg" />
            <span className="text-[13px] font-medium text-[color:var(--muted)]">
              from €4.20 per adult per day
            </span>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-[color:var(--line)] pt-4">
            {[
              ['€10m', 'medical cover'],
              ['per person', 'pricing'],
              ['−10%', 'switching discount'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="tabular font-display text-[19px] font-bold">{value}</dt>
                <dd className="text-[11px] text-[color:var(--muted)]">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The journey line — the same restrained route art, no stock imagery. */}
        <div className="card overflow-hidden">
          <div className="relative h-44" style={{ background: 'var(--ink)' }} aria-hidden>
            <svg viewBox="0 0 400 176" className="h-full w-full">
              <path
                d="M32 140 C 110 30, 250 30, 356 62"
                fill="none"
                stroke="#7fb4d9"
                strokeWidth="2"
                strokeDasharray="1 8"
                strokeLinecap="round"
              />
              <circle cx="32" cy="140" r="4" fill="var(--sun)" />
              <g transform="translate(356 62) rotate(24)">
                <path d="M0 0 L-15 6 L-11 0 L-15 -6 Z" fill="#ffffff" />
              </g>
            </svg>
          </div>
          <div className="space-y-2 p-5 text-[12px]">
            {[
              ['Medical & repatriation', '€10m'],
              ['Cancellation', '€5,000 / person'],
              ['Baggage', '€2,500 / person'],
              ['Excess', '€75'],
            ].map(([item, amount]) => (
              <div key={item} className="leader-row">
                <span className="text-[color:var(--muted)]">{item}</span>
                <span className="leader-fill" aria-hidden />
                <span className="tabular font-medium">{amount}</span>
              </div>
            ))}
            <p className="pt-2 text-[10px] leading-relaxed text-[color:var(--muted)]">
              Illustrative cover and pricing. Cover is fictional; no policy exists and no payment
              happens.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="card flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">
              Already insured elsewhere?
            </h2>
            <p className="mt-1 max-w-lg text-[13px] text-[color:var(--muted)]">
              Upload your current policy from your vault and we take 10% off — one file, shared
              like any other data point: consented, receipted, revocable.
            </p>
          </div>
          <GeenaButton demo="cover" returnTo="/quote" label="Connect with Geena" />
        </div>
      </section>
    </main>
  );
}
