'use client';

import { GeenaButton } from '@/components/geena-button';

/** The sample briefing's index table — illustrative, like every figure on this page. */
const INDICES: [string, string, boolean][] = [
  ['European equities', '+0.84%', true],
  ['Rates, 10y bund', '−4 bp', false],
  ['Brent', '−1.12%', false],
  ['EUR/USD', '+0.31%', true],
];

/**
 * Signalio — screen 1 of 3, the landing. Chapter 2 of the journey: the zero-typing chapter.
 * The pitch is editorial; the demo's real product is what does NOT happen after the button.
 */
export default function SignalioHome() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow">Daily briefing · Europe</p>
          <h1 className="font-display mt-3 max-w-xl text-[44px] font-bold leading-[1.06] tracking-tight">
            Institutional-grade research, priced like a newsletter.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[color:var(--muted)]">
            One briefing every morning: what moved, why it moved, and the one chart that matters.
            Written for people who own index funds, not people who day-trade them.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <GeenaButton demo="signalio" returnTo="/checkout" label="Connect with Geena" size="lg" />
            <span className="text-[13px] font-medium text-[color:var(--muted)]">
              €12/month · cancel anytime — <em>actually</em>
            </span>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-[color:var(--line)] pt-4">
            {[
              ['07:00', 'in your inbox'],
              ['4 min', 'median read'],
              ['0', 'fields to type'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display tabular text-[19px] font-bold">{value}</dt>
                <dd className="text-[11px] text-[color:var(--muted)]">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* This morning's sample briefing — restrained inline SVG, no stock imagery. */}
        <div className="card p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-display text-[13px] font-bold">The Morning Signal</p>
              <p className="text-[11px] text-[color:var(--muted)]">sample briefing · issue 412</p>
            </div>
            <span
              className="tabular rounded-md px-2 py-1 text-[11px] font-bold"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              4 min
            </span>
          </div>
          <svg
            viewBox="0 0 320 90"
            className="mt-4 w-full"
            role="img"
            aria-label="Illustrative intraday chart"
          >
            {[22, 45, 68].map((y) => (
              <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="var(--line)" strokeWidth="1" />
            ))}
            <path
              d="M0 62 L26 58 L52 64 L78 50 L104 54 L130 40 L156 46 L182 30 L208 36 L234 24 L260 30 L286 18 L320 22"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>
          <p className="font-display mt-3 text-[15px] font-bold leading-snug">
            The rotation nobody ordered: why defensives led a risk-on tape.
          </p>
          <div className="mt-4 space-y-2 border-t border-[color:var(--line)] pt-3 text-[12px]">
            {INDICES.map(([label, move, up]) => (
              <div key={label} className="leader-row">
                <span className="text-[color:var(--muted)]">{label}</span>
                <span className="leader-fill" aria-hidden />
                <span
                  className="tabular font-semibold"
                  style={{ color: up ? 'var(--accent)' : 'var(--ink)' }}
                >
                  {move}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-[color:var(--muted)]">
            Illustrative content and figures. Signalio is fictional; nothing here is investment
            advice — this is a Geena demo.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="card flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">
              Four data points. Zero typing.
            </h2>
            <p className="mt-1 max-w-lg text-[13px] text-[color:var(--muted)]">
              A subscription needs your name, your email, a billing address and a SEPA account —
              nothing more, so that is all we ask. Everything is already in your vault.
            </p>
          </div>
          <GeenaButton demo="signalio" returnTo="/checkout" label="Connect with Geena" />
        </div>
      </section>
    </main>
  );
}
