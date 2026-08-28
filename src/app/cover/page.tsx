'use client';

import { GeenaButton } from '@/components/geena-button';

/**
 * Cover — screen 1 of 3, the landing. Chapter 3 of the journey, set as what the product is: a
 * boarding pass. The hero ticket shows a sample family policy (fictional passengers — the real
 * ones flow in from the visitor's vault two screens later), torn on a perforation, closed with
 * a barcode.
 */
export default function CoverHome() {
  return (
    <main className="mx-auto max-w-6xl px-6">
      <section className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="eyebrow">Single-trip cover / family</p>
          <h1 className="mt-4 max-w-[520px] text-[46px] font-extrabold leading-[1.05] tracking-[-0.02em]">
            Insurance that boards with you.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-[1.65] text-[color:var(--muted)]">
            No &ldquo;traveller 2, date of birth&rdquo; forms. You flow in from your Geena vault,
            you pick which children the policy covers, and each seat is priced per person.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <GeenaButton demo="cover" returnTo="/quote" label="Connect with Geena" size="lg" />
            <span className="font-mono text-[12px] text-[color:var(--muted)]">
              FROM €4.20 / ADULT / DAY
            </span>
          </div>
          <dl className="mt-10 grid max-w-[460px] grid-cols-3 gap-5 border-t border-[color:var(--line)] pt-4">
            {[
              ['€10m', 'MEDICAL COVER'],
              ['per person', 'PRICING'],
              ['−10%', 'SWITCHING'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-[19px] font-extrabold">{value}</dt>
                <dd className="font-mono mt-0.5 text-[9.5px] tracking-[0.08em] text-[color:var(--mono-muted)]">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The hero ticket. */}
        <div className="card relative overflow-hidden !shadow-[0_12px_32px_rgba(27,39,51,0.08)]">
          <div className="px-6 pb-5 pt-5">
            <div className="font-mono flex items-baseline justify-between text-[10px] tracking-[0.1em] text-[color:var(--mono-muted)]">
              <span>COVER / FAMILY POLICY</span>
              <span>CLASS: SINGLE TRIP</span>
            </div>
            <div className="mt-3.5 flex items-center gap-4.5">
              <span className="text-[34px] font-extrabold tracking-[0.02em]">AMS</span>
              <span
                className="flex-1"
                style={{ borderTop: '2px dotted var(--dotted)' }}
                aria-hidden
              />
              <span className="text-[34px] font-extrabold tracking-[0.02em]">LIS</span>
            </div>
            <div className="font-mono mt-1 flex justify-between text-[9.5px] text-[color:var(--mono-muted)]">
              <span>AMSTERDAM</span>
              <span>7 DAYS / EUROPE</span>
              <span>LISBON</span>
            </div>
            <div className="mt-3 flex justify-end">
              <span className="stamp" style={{ transform: 'rotate(-6deg)' }}>
                −10% SWITCHER
              </span>
            </div>
          </div>
          <div className="tear" />
          <div className="px-6 pb-[22px] pt-4.5">
            <p className="font-mono text-[9.5px] tracking-[0.1em] text-[color:var(--mono-muted)]">
              PASSENGERS — FROM YOUR VAULT
            </p>
            <div className="font-mono mt-2.5 flex flex-col gap-[7px] text-[12px]">
              {[
                ['WEBER/ANNA', 'ADULT', '€4.20/DAY'],
                ['WEBER/LENA', 'CHILD', '€2.10/DAY'],
                ['WEBER/JONAS', 'CHILD', '€2.10/DAY'],
              ].map(([code, kind, price]) => (
                <div key={code} className="flex justify-between">
                  <span>{code}</span>
                  <span className="text-[color:var(--mono-muted)]">{kind}</span>
                  <span>{price}</span>
                </div>
              ))}
            </div>
            <div className="barcode mt-4 h-9" aria-hidden />
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="card grid gap-6 px-7 py-[22px] text-[12px] sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Medical & repatriation', '€10m'],
            ['Cancellation', '€5,000 / person'],
            ['Baggage', '€2,500 / person'],
            ['Excess', '€75'],
          ].map(([item, amount]) => (
            <div key={item} className="leader-row">
              <span className="text-[color:var(--mono-muted)]">{item}</span>
              <span className="leader-fill" aria-hidden />
              <span className="font-mono font-semibold">{amount}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
