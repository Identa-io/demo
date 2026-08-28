import { cookies, headers } from 'next/headers';
import { DEMOS, JOURNEY, PROGRESS_COOKIE, type DemoSlug } from '@/lib/demos';

/**
 * The hub: one journey, three chapters, walked in order. Each card states its ask in one
 * generalized line — the full manifest lives one click away, in the demo's backstage drawer.
 * Progress lives in a hub-origin cookie (the demos are separate origins by design), written by
 * the middleware when a chapter-finish CTA routes back through here.
 *
 * On demo.test.geena.eu each chapter leads to the demo's own subdomain — every partner is its
 * own origin, and so is every demo; on a bare host the same routes work path-style.
 */
export default async function Journey() {
  const host = (await headers()).get('host') ?? '';
  const subdomainMode = host.startsWith('demo.');
  const hrefFor = (slug: string) => (subdomainMode ? `//${slug}.${host}` : `/${slug}`);

  const doneCookie = (await cookies()).get(PROGRESS_COOKIE)?.value ?? '';
  const done = new Set(doneCookie.split(',').filter(Boolean));
  const current = JOURNEY.find((slug) => !done.has(slug)) ?? JOURNEY[0];

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
            className="text-[12px] font-medium text-[color:var(--muted)] underline underline-offset-4 hover:text-[color:var(--ink)]"
          >
            Source on GitHub — the repo is the reference integration
          </a>
        </header>

        <section className="border-t border-[color:var(--line)] py-14">
          <p className="eyebrow">Connect with Geena · test environment · 5–10 minutes</p>
          <h1 className="mt-4 max-w-2xl text-[46px] font-bold leading-[1.05] tracking-tight">
            Type it once. Never type it again.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[color:var(--muted)]">
            One story, three fictional companies, walked in order. Chapter 1 is the last long form
            you fill — into your own vault. Chapter 2 shows what that bought you: nothing to type.
            Chapter 3 asks only for what no company has ever had. Use your real email: the consent
            ceremony you will see is the real one.
          </p>

          {/* The scoreboard — the entire pitch, in three figures. */}
          <dl className="mt-8 grid max-w-2xl gap-6 border-t border-[color:var(--line)] pt-5 sm:grid-cols-3">
            {[
              ['12', 'data points you type — all in chapter 1, plus the kids'],
              ['0', 'typed in chapter 2 — that silence is the product'],
              ['22', 'data points delivered — always current, always revocable'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="tabular text-[32px] font-bold tracking-tight">{value}</dt>
                <dd className="mt-1 text-[12px] leading-relaxed text-[color:var(--muted)]">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-5 pb-4">
          {JOURNEY.map((slug) => {
            const demo = DEMOS[slug];
            const finished = done.has(slug);
            const isNext = slug === current && !finished;
            return (
              <a
                key={slug}
                href={hrefFor(slug)}
                className={`group grid overflow-hidden rounded-2xl bg-[color:var(--card)] shadow-sm ring-1 transition-shadow hover:shadow-md md:grid-cols-[220px_1fr] ${
                  isNext ? 'ring-2 ring-[color:var(--accent)]' : 'ring-[color:var(--line)]'
                }`}
              >
                <CardArt slug={slug} />
                <div className="flex flex-col p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-3">
                      <span
                        className={`tabular flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold ${
                          finished
                            ? 'bg-[color:var(--accent)] text-white'
                            : 'bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
                        }`}
                      >
                        {finished ? '✓' : demo.chapter}
                      </span>
                      <span className="text-[17px] font-bold tracking-tight">{demo.name}</span>
                      {isNext && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                          style={{ background: 'var(--accent)' }}
                        >
                          {done.size ? 'continue here' : 'start here'}
                        </span>
                      )}
                    </p>
                    <span className="flex flex-wrap justify-end gap-1">
                      {demo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[color:var(--line)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--muted)]">
                    {demo.scenario} Asks for {demo.asks}.
                  </p>
                  <p className="mt-2 flex-1 text-[12px] leading-relaxed">
                    <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                      Watch for:
                    </span>{' '}
                    <span className="text-[color:var(--ink)]">{demo.watchFor}</span>{' '}
                    <span className="text-[color:var(--muted)]">{demo.proves}</span>
                  </p>
                  <span className="mt-3 text-[13px] font-semibold group-hover:underline group-hover:underline-offset-4">
                    {finished ? `Revisit ${demo.name} →` : `Open chapter ${demo.chapter} →`}
                  </span>
                </div>
              </a>
            );
          })}
        </section>

        <section className="my-12 grid gap-px overflow-hidden rounded-2xl bg-[color:var(--line)] ring-1 ring-[color:var(--line)] sm:grid-cols-3">
          {[
            [
              'Connect',
              'One hop to Geena: sign in or sign up there, one consent screen. The company never sees a password, a code, or your vault.',
            ],
            [
              'Grant',
              'You choose what each company gets, item by item — typing it once into your vault, or handing over what is already there.',
            ],
            [
              'Served fresh',
              'Companies read the current version of exactly what you granted. Every read leaves a receipt; revoking ends it, entirely.',
            ],
          ].map(([title, text], index) => (
            <div key={title} className="bg-[color:var(--card)] p-6">
              <h3 className="flex items-baseline gap-2 text-[12px] font-bold tracking-wide">
                <span className="vault-value text-[10px] text-[color:var(--muted)]">
                  0{index + 1}
                </span>
                {title}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-[color:var(--muted)]">{text}</p>
            </div>
          ))}
        </section>

        <footer className="flex flex-col items-center gap-1 border-t border-[color:var(--line)] py-10 text-center text-[11px] text-[color:var(--muted)]">
          <p>
            Yield, Signalio and Cover are fictional. Everything runs against the Geena test
            environment — no payments, no policies, no briefings, and nothing stored beyond your
            demo session.
          </p>
          <p>
            Data served from a vault is always set in{' '}
            <span className="vault-value">this typeface</span> — so you can tell which pixels came
            from Geena. Every page also has a <strong className="font-semibold">Backstage</strong>{' '}
            button: the manifest, the live connection, and each API call the integration made.
          </p>
        </footer>
      </main>
    </div>
  );
}

/** Restrained inline-SVG art per brand — no stock imagery in a public repo. */
function CardArt({ slug }: { slug: DemoSlug }) {
  if (slug === 'yield') {
    return (
      <div
        className="flex h-28 items-end px-5 pb-4 md:h-full"
        style={{ background: '#0d211b' }}
        aria-hidden
      >
        <svg viewBox="0 0 240 64" className="w-full">
          {[16, 40].map((y) => (
            <line key={y} x1="0" x2="240" y1={y} y2={y} stroke="#28413a" strokeWidth="1" />
          ))}
          <path
            d="M0 56 L30 50 L60 53 L90 42 L120 38 L150 28 L180 32 L210 18 L240 10"
            fill="none"
            stroke="#7fb89f"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  if (slug === 'signalio') {
    return (
      <div
        className="flex h-28 items-end gap-1.5 px-6 pb-4 md:h-full"
        style={{ background: '#14161d' }}
        aria-hidden
      >
        <svg viewBox="0 0 240 72" className="w-full">
          {[26, 8, 34, 16, 44, 22, 52, 30, 60].map((height, index) => (
            <rect
              key={index}
              x={index * 27}
              y={68 - height}
              width="14"
              height={height}
              rx="2"
              fill={index === 8 ? '#d9542b' : '#3a3f4a'}
            />
          ))}
        </svg>
      </div>
    );
  }
  return (
    <div className="relative h-28 md:h-full" style={{ background: '#0f2a3d' }} aria-hidden>
      <svg viewBox="0 0 240 112" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <path
          d="M20 88 C 70 16, 150 16, 214 38"
          fill="none"
          stroke="#7fb4d9"
          strokeWidth="2"
          strokeDasharray="1 8"
          strokeLinecap="round"
        />
        <circle cx="20" cy="88" r="3.5" fill="#e8a13c" />
        <g transform="translate(214 38) rotate(24)">
          <path d="M0 0 L-13 5 L-10 0 L-13 -5 Z" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
