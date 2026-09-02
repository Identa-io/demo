import { cookies, headers } from 'next/headers';
import { JOURNEY, PROGRESS_COOKIE, type DemoSlug } from '@/lib/demos';

/**
 * The hub: one journey, three chapters, walked in order. Per the design contract each card
 * already speaks its company's language — Yield in engraved serif, Signalio in terminal
 * grotesk, Cover as a boarding pass — while the page around them stays neutral Geena chrome.
 * Progress lives in a hub-origin cookie (the demos are separate origins by design), written by
 * the middleware when a chapter-finish CTA routes back through here.
 */
export default async function Journey() {
  const host = (await headers()).get('host') ?? '';
  const subdomainMode = host.startsWith('demo.');
  const hrefFor = (slug: string) => (subdomainMode ? `//${slug}.${host}` : `/${slug}`);

  const doneCookie = (await cookies()).get(PROGRESS_COOKIE)?.value ?? '';
  const done = new Set(doneCookie.split(',').filter(Boolean));
  const current = JOURNEY.find((slug) => !done.has(slug)) ?? JOURNEY[0];
  const status = (slug: DemoSlug) =>
    done.has(slug) ? 'complete' : slug === current ? (done.size ? 'continue here' : 'start here') : '';

  const yieldStatus = status('yield');
  const signalioStatus = status('signalio');
  const coverStatus = status('cover');

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-6">
        <header className="flex items-center justify-between py-7">
          <span className="flex items-baseline gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
            <img src="/geena/logo-black.svg" alt="Geena" className="h-[22px] w-auto" />
            <span className="text-[15px] font-medium tracking-tight text-[color:var(--muted)]">
              journey
            </span>
          </span>
          <a
            href="https://github.com/Identa-io/demo"
            title="Source on GitHub"
            aria-label="Source on GitHub"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--muted)] hover:text-[color:var(--ink)]"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </a>
        </header>

        <section className="border-t border-[color:var(--line)] pb-9 pt-11 text-center">
          <p className="eyebrow">Connect with Geena · test environment · 5–10 minutes</p>
          <h1 className="mx-auto mt-3.5 max-w-2xl text-[46px] font-bold leading-[1.05] tracking-tight">
            Type it once. Never type it again.
          </h1>
          <p className="mx-auto mt-3.5 max-w-xl text-[14px] leading-relaxed text-[color:var(--muted)]">
            Three fictional companies, three different worlds — one recognizable button in all of
            them. Walk the chapters in order; each card below already speaks its company&apos;s
            language.
          </p>

          {/* The scoreboard — the annotated keep from the design pass: the pitch in three figures. */}
          <dl className="mx-auto mt-9 grid max-w-2xl grid-cols-3 gap-6 border-t border-[color:var(--line)] pt-5 text-left">
            {[
              ['12', 'data points you type — all in chapter 1'],
              ['0', 'typed in chapter 2'],
              ['22', 'data points delivered — live from your vault'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="tabular text-[30px] font-bold tracking-tight">{value}</dt>
                <dd className="mt-0.5 text-[11.5px] leading-relaxed text-[color:var(--muted)]">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="grid items-stretch gap-5 pb-10 md:grid-cols-3">
          {/* Chapter I — Yield, in engraved serif on private-bank paper. */}
          <a
            href={hrefFor('yield')}
            className="flex flex-col rounded-[14px] border p-6 shadow-sm transition-shadow hover:shadow-lg"
            style={{
              background: '#f5f3ea',
              color: '#16302a',
              borderColor: '#cfc9b4',
              fontFamily: 'var(--font-spectral), serif',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full border text-[15px] font-semibold"
                style={{ borderColor: '#16302a', fontFamily: 'var(--font-cormorant), serif' }}
              >
                Y
              </span>
              <span
                className="text-[9.5px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: '#8a7c55', fontFamily: 'var(--font-inter), sans-serif' }}
              >
                Chapter I{yieldStatus && ` · ${yieldStatus}`}
              </span>
            </div>
            <p
              className="mt-4 text-[26px] font-semibold tracking-[0.06em]"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              Yield
            </p>
            <p
              className="mt-0.5 text-[9.5px] uppercase tracking-[0.18em]"
              style={{ color: '#8a7c55', fontFamily: 'var(--font-inter), sans-serif' }}
            >
              Private index funds
            </p>
            <p className="mt-3.5 flex-1 text-[13px] leading-[1.65]" style={{ color: '#5f6b60' }}>
              The heaviest onboarding of your life, once — identity, ID document, payout account
              and tax residency, typed into your vault, not their form.
            </p>
            <svg viewBox="0 0 300 56" className="mt-4 w-full" aria-hidden>
              <line x1="0" x2="300" y1="16" y2="16" stroke="#ddd8c4" strokeWidth="1" />
              <line x1="0" x2="300" y1="38" y2="38" stroke="#ddd8c4" strokeWidth="1" />
              <path
                d="M0 48 L38 43 L76 46 L114 35 L152 31 L190 22 L228 26 L266 13 L300 7"
                fill="none"
                stroke="#16302a"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="mt-3.5 flex h-10 items-center justify-center gap-2 rounded-lg text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{
                background: '#16302a',
                color: '#f5f3ea',
                fontFamily: 'var(--font-inter), sans-serif',
              }}
            >
              Open Yield →
            </span>
          </a>

          {/* Chapter 2 — Signalio, terminal grotesk under a dark chart header. */}
          <a
            href={hrefFor('signalio')}
            className="flex flex-col overflow-hidden rounded-[14px] border bg-white shadow-sm transition-shadow hover:shadow-lg"
            style={{ color: '#14161d', borderColor: '#e3e2dd' }}
          >
            <div className="flex h-24 items-end px-5.5 pb-3" style={{ background: '#14161d' }} aria-hidden>
              <svg viewBox="0 0 240 56" className="w-full">
                {[
                  [0, 22],
                  [27, 10],
                  [54, 28],
                  [81, 16],
                  [108, 36],
                  [135, 22],
                  [162, 44],
                  [189, 28],
                ].map(([x, height]) => (
                  <rect key={x} x={x} y={56 - height} width="14" height={height} rx="2" fill="#3a3f4a" />
                ))}
                <rect x="216" y="5" width="14" height="51" rx="2" fill="#d9542b" />
              </svg>
            </div>
            <div className="flex flex-1 flex-col px-5.5 py-5">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-[26px] w-[26px] items-center justify-center rounded-md text-[12px] font-bold text-white"
                  style={{ background: '#d9542b' }}
                >
                  S
                </span>
                <span
                  className="text-[19px] font-bold tracking-tight"
                  style={{ fontFamily: 'var(--font-grotesk), sans-serif' }}
                >
                  Signalio
                </span>
                <span
                  className="ml-auto text-[10px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: '#d9542b' }}
                >
                  Chapter 2{signalioStatus && ` · ${signalioStatus}`}
                </span>
              </div>
              <p className="mt-3 flex-1 text-[12.5px] leading-relaxed" style={{ color: '#6d6f75' }}>
                Subscribe to market research — one consent screen, a running subscription. Name,
                email, billing address, SEPA: every ask already in your vault.
              </p>
              <span
                className="mt-2.5 flex h-10 items-center justify-center gap-2 rounded-lg text-[13.5px] font-bold text-white"
                style={{ background: '#d9542b', fontFamily: 'var(--font-grotesk), sans-serif' }}
              >
                Open Signalio →
              </span>
            </div>
          </a>

          {/* Chapter 3 — Cover, a boarding pass with a perforation and a barcode. */}
          <a
            href={hrefFor('cover')}
            className="flex flex-col overflow-hidden rounded-[14px] border bg-white shadow-sm transition-shadow hover:shadow-lg"
            style={{
              color: '#1b2733',
              borderColor: '#d9dde0',
              fontFamily: 'var(--font-public), sans-serif',
            }}
          >
            <div className="px-5.5 pb-3.5 pt-4.5">
              <div
                className="flex items-baseline justify-between text-[9.5px] tracking-[0.1em]"
                style={{ color: '#6d7883', fontFamily: 'var(--font-plexmono), monospace' }}
              >
                <span>COVER / FAMILY POLICY</span>
                <span>
                  CHAPTER 3{coverStatus && ` · ${coverStatus.toUpperCase()}`}
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-3.5">
                <span className="text-[26px] font-extrabold tracking-[0.02em]">AMS</span>
                <span className="flex-1" style={{ borderTop: '2px dotted #9fb3c2' }} />
                <span className="text-[26px] font-extrabold tracking-[0.02em]">LIS</span>
              </div>
              <div
                className="mt-1 flex justify-between text-[9px]"
                style={{ color: '#6d7883', fontFamily: 'var(--font-plexmono), monospace' }}
              >
                <span>THE FAMILY TRIP</span>
                <span>PRICED PER PERSON</span>
              </div>
            </div>
            <div className="relative" style={{ borderTop: '2px dashed #d9dde0' }}>
              <span
                className="absolute -left-[9px] -top-[9px] h-[18px] w-[18px] rounded-full"
                style={{ background: 'var(--bg)', borderRight: '1px solid #d9dde0' }}
              />
              <span
                className="absolute -right-[9px] -top-[9px] h-[18px] w-[18px] rounded-full"
                style={{ background: 'var(--bg)', borderLeft: '1px solid #d9dde0' }}
              />
            </div>
            <div className="flex flex-1 flex-col px-5.5 pb-4.5 pt-3.5">
              <p className="flex-1 text-[12.5px] leading-relaxed" style={{ color: '#5c6a75' }}>
                Insure the family trip — you flow in from your vault, you pick which children the
                policy covers, and one optional file earns a discount.
              </p>
              <div className="mt-3">
                <span
                  className="inline-block border-2 border-dashed px-2 py-[3px] text-[9px] font-semibold tracking-[0.08em]"
                  style={{
                    transform: 'rotate(-4deg)',
                    borderColor: '#d95b43',
                    color: '#d95b43',
                    fontFamily: 'var(--font-plexmono), monospace',
                  }}
                >
                  −10% SWITCHER
                </span>
              </div>
              <div
                className="mt-3 h-[22px]"
                style={{
                  background:
                    'repeating-linear-gradient(90deg,#1b2733 0,#1b2733 2px,transparent 2px,transparent 5px,#1b2733 5px,#1b2733 6px,transparent 6px,transparent 10px)',
                }}
                aria-hidden
              />
              <span
                className="mt-2.5 flex h-10 items-center justify-center gap-2 rounded-lg text-[13px] font-extrabold text-white"
                style={{ background: '#1b2733' }}
              >
                Open Cover →
              </span>
            </div>
          </a>
        </section>
      </main>
    </div>
  );
}
