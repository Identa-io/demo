'use client';

import { GeenaButton } from '@/components/geena-button';
import { YieldHeader } from './header';
import { FUNDS } from './funds';

/**
 * Yield — screen 1 of 3, the landing, set like a private bank's opening page: serif headline,
 * one growth chart, the fund list as a statement. Per the annotated design rule, both columns
 * close on the same double rule — the stats ledger left, the fund list right.
 */
export default function YieldHome() {
  return (
    <>
      <YieldHeader variant="inline" />
      <main className="flex flex-1 items-center">
        <div className="mx-auto grid w-full max-w-6xl items-stretch gap-10 px-6 py-11 lg:grid-cols-[1.05fr_1fr] lg:gap-[72px] lg:pb-14">
          <section className="flex flex-col">
            <p className="eyebrow">In service of patient capital since 2019</p>
            <h1 className="font-display mt-4 text-[52px] font-semibold leading-[1.08]">
              Wealth, quietly compounded.
            </h1>
            <p className="mt-4 max-w-[480px] text-[15.5px] leading-[1.7] text-[color:var(--muted)]">
              Three index funds, a single published fee, and an investor account that opens in
              minutes. Your identity, payout account and tax residency stay in your Geena vault —
              read with your consent, never copied into ours.
            </p>
            <div className="mt-7 flex items-center gap-4">
              <GeenaButton demo="yield" returnTo="/apply" label="Connect with Geena" size="lg" />
            </div>
            <dl className="ledger-open ledger-close mt-10 grid max-w-[480px] grid-cols-3 justify-between gap-6 py-4 lg:mt-auto">
              {[
                ['0.10–0.18%', 'Annual fee'],
                ['3', 'Index funds'],
                ['€3.8bn', 'Under management'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display tabular text-[24px] font-semibold">{value}</dt>
                  <dd className="mt-1 text-[9.5px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-label="Performance and funds" className="flex flex-col">
            <div className="flex items-center gap-4">
              <span className="flex-1 border-t border-[color:var(--line)]" />
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                Growth of €10,000
              </h2>
              <span className="flex-1 border-t border-[color:var(--line)]" />
            </div>
            <svg
              viewBox="0 0 460 190"
              className="mt-4 h-auto w-full"
              role="img"
              aria-label="Growth of 10,000 euro invested in Yield Global Index, 2019 to 2026"
            >
              {[12, 53, 94, 135].map((y) => (
                <line key={y} x1="40" x2="460" y1={y} y2={y} stroke="var(--line-faint)" strokeWidth="1" />
              ))}
              <line x1="40" x2="460" y1="168" y2="168" stroke="var(--ink)" strokeWidth="1.2" />
              {[
                ['16k', 16],
                ['14k', 57],
                ['12k', 98],
                ['10k', 139],
              ].map(([label, y]) => (
                <text
                  key={label}
                  x="34"
                  y={y}
                  textAnchor="end"
                  fontFamily="var(--font-plexmono), monospace"
                  fontSize="9"
                  fill="var(--mono-muted)"
                >
                  {label}
                </text>
              ))}
              <path
                d="M40 135 L70 128 L100 132 L130 118 L160 122 L190 107 L220 110 L250 92 L280 84 L310 89 L340 68 L370 62 L400 45 L430 39 L452 22"
                fill="none"
                stroke="var(--ink)"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="452" cy="22" r="2.8" fill="var(--ink)" />
              <text
                x="448"
                y="10"
                textAnchor="end"
                fontFamily="var(--font-cormorant), serif"
                fontSize="14"
                fontWeight="600"
                fill="var(--ink)"
              >
                €15,820
              </text>
              <text x="40" y="184" fontFamily="var(--font-plexmono), monospace" fontSize="9" fill="var(--mono-muted)">
                2019
              </text>
              <text
                x="452"
                y="184"
                textAnchor="end"
                fontFamily="var(--font-plexmono), monospace"
                fontSize="9"
                fill="var(--mono-muted)"
              >
                2026
              </text>
            </svg>
            <div id="funds" className="ledger-open mt-6 lg:mt-auto">
              {FUNDS.map((fund, index) => (
                <div
                  key={fund.id}
                  className={`flex items-baseline justify-between gap-4 py-3 ${
                    index === FUNDS.length - 1 ? 'ledger-close' : 'border-b border-[color:var(--line)]'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="font-display block text-[18px] font-semibold">{fund.name}</span>
                    <span className="block text-[11.5px] text-[color:var(--muted)]">
                      {fund.strategy} · {fund.fee.toFixed(2)}%
                    </span>
                  </span>
                  <span className="font-display whitespace-nowrap text-[18px] font-semibold">
                    <span className="align-[2px] text-[8.5px] font-semibold uppercase tracking-[0.16em] text-[color:var(--gold)]" style={{ fontFamily: 'var(--font-inter)' }}>
                      5y{' '}
                    </span>
                    +{fund.fiveYear.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
