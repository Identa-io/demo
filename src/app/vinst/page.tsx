'use client';

import { useDemoBase } from '@/lib/use-geena';
import { FUNDS } from './funds';

/**
 * Vinst — a fund platform. The register flow is the demo; this page exists so the flow starts
 * where it would in real life: on a product page you were reading anyway.
 */
export default function VinstHome() {
  const base = useDemoBase('vinst');

  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow">Index funds · Nordics</p>
          <h1 className="font-display mt-3 max-w-xl text-[44px] font-semibold leading-[1.06] tracking-tight">
            Long-term investing, without the long form.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[color:var(--muted)]">
            Three funds, one fee promise, and an account that opens in minutes and stays current —
            your identity, payout account and tax residency live in your Geena vault, not in our
            filing cabinet.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a href={`${base}/register`} className="btn-primary !px-6 !py-3 !text-[14px]">
              Open an account
            </a>
            <a href={`${base}/#funds`} className="btn-secondary">
              See the funds
            </a>
          </div>
          {/* Set like a statement extract: opens on a rule, closes over a double rule. */}
          <dl className="ledger-open ledger-close mt-10 grid max-w-md grid-cols-3 gap-6 pb-4 pt-4">
            {[
              ['0.12–0.24%', 'annual fee'],
              ['3', 'index funds'],
              ['SEK 4.1bn', 'under management'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="tabular text-[19px] font-semibold">{value}</dt>
                <dd className="text-[11px] text-[color:var(--muted)]">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* A restrained performance card — inline SVG, no libraries, no stock imagery. */}
        <div className="card p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[13px] font-semibold">Vinst Norden Index</p>
              <p className="text-[11px] text-[color:var(--muted)]">5 years, indexed to 100</p>
            </div>
            <p className="tabular text-[15px] font-semibold" style={{ color: 'var(--accent)' }}>
              +62.4%
            </p>
          </div>
          <svg
            viewBox="0 0 320 140"
            className="mt-4 w-full"
            role="img"
            aria-label="Illustrative five-year performance chart"
          >
            <defs>
              <linearGradient id="vinst-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[35, 70, 105].map((y) => (
              <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="var(--line)" strokeWidth="1" />
            ))}
            <path
              d="M0 118 L28 112 L56 116 L84 100 L112 96 L140 84 L168 90 L196 72 L224 60 L252 66 L280 44 L320 30"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M0 118 L28 112 L56 116 L84 100 L112 96 L140 84 L168 90 L196 72 L224 60 L252 66 L280 44 L320 30 L320 140 L0 140 Z"
              fill="url(#vinst-fill)"
            />
          </svg>
          <p className="mt-3 text-[10px] leading-relaxed text-[color:var(--muted)]">
            Illustrative figures. Capital at risk — the value of investments can go down as well as
            up. Vinst is a fictional platform; this is a Geena demo.
          </p>
        </div>
      </section>

      <section id="funds" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-tight">The funds</h2>
          <p className="text-[12px] text-[color:var(--muted)]" id="pricing">
            One fee per fund. Nothing else, ever.
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {FUNDS.map((fund) => (
            <article key={fund.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-semibold">{fund.name}</h3>
                  <p className="tabular mt-0.5 text-[10px] tracking-wide text-[color:var(--muted)]">
                    {fund.isin}
                  </p>
                </div>
                <span
                  className="tabular rounded-md px-2 py-1 text-[11px] font-bold"
                  style={{
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                  }}
                >
                  {fund.fee.toFixed(2)}%
                </span>
              </div>
              <p className="mt-2 min-h-9 text-[12px] leading-relaxed text-[color:var(--muted)]">
                {fund.strategy}
              </p>
              <dl className="mt-4 flex items-center justify-between border-t border-[color:var(--line)] pt-3 text-[12px]">
                <div>
                  <dt className="text-[color:var(--muted)]">5y return</dt>
                  <dd className="tabular font-semibold">{fund.fiveYear.toFixed(1)}%</dd>
                </div>
                <div className="text-right">
                  <dt className="text-[color:var(--muted)]">Risk (1–7)</dt>
                  <dd className="mt-1 flex gap-0.5" aria-label={`Risk ${fund.risk} of 7`}>
                    {Array.from({ length: 7 }, (_, index) => (
                      <span
                        key={index}
                        className="h-1.5 w-2.5 rounded-sm"
                        style={{
                          background: index < fund.risk ? 'var(--accent)' : 'var(--line)',
                        }}
                      />
                    ))}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <div className="card mt-10 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Ready when you are.
            </h2>
            <p className="mt-1 text-[13px] text-[color:var(--muted)]">
              Identity, payout account and tax residency — one consent, no retyping, always the
              current version.
            </p>
          </div>
          <a href={`${base}/register`} className="btn-primary shrink-0 !px-6 !py-3 !text-[14px]">
            Open an account
          </a>
        </div>
      </section>
    </main>
  );
}
