import { headers } from 'next/headers';
import { DEMO_SLUGS, DEMOS } from '@/lib/demos';

const CARD_ART: Record<string, string> = {
  blomma: 'linear-gradient(135deg,#f6d5d0,#d96c47)',
  fckomet: 'linear-gradient(135deg,#0b1f4b,#3e7cb1)',
  nyckel: 'linear-gradient(135deg,#e8e2d6,#5b7c99)',
};

const CARD_MARK: Record<string, string> = { blomma: '🌸', fckomet: '⚽', nyckel: '🔑' };

/**
 * The gallery: one page, three doors. On demo.test.geena.eu each card leads to the demo's own
 * subdomain — every partner is its own origin, and so is every demo. On a bare host (local dev)
 * the same routes work path-style.
 */
export default async function Landing() {
  const host = (await headers()).get('host') ?? '';
  const subdomainMode = host.startsWith('demo.');
  const hrefFor = (slug: string) =>
    subdomainMode ? `//${slug}.${host}` : `/${slug}`;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-6">
        <header className="flex items-center justify-between py-8">
          <span className="text-[15px] font-bold tracking-tight">
            <span
              className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-black text-white"
              style={{ background: 'var(--geena)' }}
            >
              G
            </span>
            Geena demos
          </span>
          <a
            href="https://github.com/Identa-io/demo"
            className="text-[12px] font-medium text-[color:var(--muted)] underline underline-offset-2 hover:opacity-70"
          >
            source — this repo is the integration
          </a>
        </header>

        <section className="py-10">
          <h1 className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight">
            Your data, asked for properly.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[color:var(--muted)]">
            Three small fictional brands, each built on Connect with Geena. Use your real email —
            you&apos;ll experience the real ceremony, on Geena&apos;s test environment.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {DEMO_SLUGS.map((slug) => {
            const demo = DEMOS[slug];
            return (
              <a
                key={slug}
                href={hrefFor(slug)}
                className="group overflow-hidden rounded-3xl bg-[color:var(--card)] shadow-sm ring-1 ring-[color:var(--line)] transition-shadow hover:shadow-md"
              >
                <div
                  className="flex h-36 items-center justify-center text-5xl"
                  style={{ background: CARD_ART[slug] }}
                  aria-hidden
                >
                  {CARD_MARK[slug]}
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold tracking-tight">{demo.name}</h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--muted)]">
                    {demo.scenario}
                  </p>
                  <p className="mt-3 text-[12px] font-medium leading-relaxed">
                    <span className="text-[color:var(--accent)]">Proves:</span> {demo.proves}
                  </p>
                  <span className="mt-4 inline-block text-[13px] font-semibold group-hover:underline">
                    Open the demo →
                  </span>
                </div>
              </a>
            );
          })}
        </section>

        <section className="my-14 grid gap-4 rounded-3xl bg-[color:var(--card)] p-6 ring-1 ring-[color:var(--line)] sm:grid-cols-3">
          {[
            ['1 · Connect', 'One hop to Geena: sign in or sign up there, one consent screen. The app never sees a password or a code.'],
            ['2 · Grant', 'You choose what each brand gets, item by item, in your own Geena — and you can change your mind later.'],
            ['3 · Served fresh', 'Apps read the current version of exactly what you granted. Every read leaves a receipt; revoking ends it.'],
          ].map(([title, text]) => (
            <div key={title}>
              <h3 className="text-[13px] font-bold">{title}</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-[color:var(--muted)]">{text}</p>
            </div>
          ))}
        </section>

        <footer className="pb-16 text-center text-[11px] text-[color:var(--muted)]">
          All brands are fictional. Runs against the Geena test environment — no production data,
          no payments, nothing stored beyond your demo session.
        </footer>
      </main>
    </div>
  );
}
