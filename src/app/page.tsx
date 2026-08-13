import { headers } from 'next/headers';
import { DEMO_SLUGS, DEMOS, type DemoSlug } from '@/lib/demos';
import vinstManifest from '../../manifests/vinst.json';
import resaManifest from '../../manifests/resa.json';
import vagnManifest from '../../manifests/vagn.json';

interface ManifestFile {
  name: string;
  slots: { label?: string }[];
  subjects?: { label?: string }[];
}

const MANIFESTS: Record<DemoSlug, ManifestFile> = {
  vinst: vinstManifest,
  resa: resaManifest,
  vagn: vagnManifest,
};

/**
 * The gallery: one page, three doors. Each card is a CONNECTION RECORD — in Geena's world the
 * ask is the identity, so the card shows an excerpt of the demo's actual manifest (imported from
 * the same files the studio publishes). On demo.test.geena.eu each card leads to the demo's own
 * subdomain — every partner is its own origin, and so is every demo; on a bare host the same
 * routes work path-style.
 */
export default async function Landing() {
  const host = (await headers()).get('host') ?? '';
  const subdomainMode = host.startsWith('demo.');
  const hrefFor = (slug: string) => (subdomainMode ? `//${slug}.${host}` : `/${slug}`);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-6">
        <header className="flex items-center justify-between py-7">
          <span className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[13px] font-black text-white"
              style={{ background: 'var(--geena)' }}
              aria-hidden
            >
              G
            </span>
            Geena demos
          </span>
          <a
            href="https://github.com/Identa-io/demo"
            className="text-[12px] font-medium text-[color:var(--muted)] underline underline-offset-4 hover:text-[color:var(--ink)]"
          >
            Source on GitHub — the repo is the reference integration
          </a>
        </header>

        <section className="border-t border-[color:var(--line)] py-14">
          <p className="eyebrow">Connect with Geena · test environment</p>
          <h1 className="mt-4 max-w-2xl text-[46px] font-bold leading-[1.05] tracking-tight">
            Your data, asked for properly.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[color:var(--muted)]">
            Three fictional companies — a fund platform, a travel insurer, a car-rental firm — each
            integrating Geena the way a real partner would. Use your real email: the consent
            ceremony you will see is the real one.
          </p>
        </section>

        <section className="grid gap-6 pb-4 md:grid-cols-3">
          {DEMO_SLUGS.map((slug) => {
            const demo = DEMOS[slug];
            const manifest = MANIFESTS[slug];
            const asks = manifest.slots
              .map((slot) => slot.label)
              .filter((label): label is string => !!label);
            const shown = asks.slice(0, 3);
            return (
              <a
                key={slug}
                href={hrefFor(slug)}
                className="group flex flex-col overflow-hidden rounded-2xl bg-[color:var(--card)] shadow-sm ring-1 ring-[color:var(--line)] transition-shadow hover:shadow-md"
              >
                <CardArt slug={slug} />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-[17px] font-bold tracking-tight">{demo.name}</h2>
                    <div className="flex flex-wrap justify-end gap-1">
                      {demo.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[color:var(--line)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--muted)]">
                    {demo.scenario}
                  </p>

                  {/* The ask IS the identity: an excerpt of the manifest this demo opens. */}
                  <div className="mt-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--bg)]/60 px-3.5 py-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                      It asks for
                    </p>
                    <ul className="vault-value mt-1.5 space-y-1 text-[11.5px] text-[color:var(--ink)]/85">
                      {shown.map((label) => (
                        <li key={label} className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className="h-[5px] w-[5px] shrink-0 rounded-full border"
                            style={{ borderColor: 'var(--accent)' }}
                          />
                          {label}
                        </li>
                      ))}
                      {asks.length > shown.length && (
                        <li className="text-[color:var(--muted)]">
                          + {asks.length - shown.length} more
                          {manifest.subjects?.length
                            ? ` · ${manifest.subjects[0]?.label?.toLowerCase()}`
                            : ''}
                        </li>
                      )}
                    </ul>
                  </div>

                  <p className="mt-3 flex-1 text-[12px] leading-relaxed">
                    <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                      What it proves:
                    </span>{' '}
                    <span className="text-[color:var(--muted)]">{demo.proves}</span>
                  </p>
                  <span className="mt-4 text-[13px] font-semibold group-hover:underline group-hover:underline-offset-4">
                    Open {demo.name} →
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
              'You choose what each company gets, item by item, in your own Geena — and you can change your mind at any time.',
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
            Vinst, Resa and Vagn are fictional. Everything runs against the Geena test environment —
            no payments, no policies, no cars, and nothing stored beyond your demo session.
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
  if (slug === 'vinst') {
    return (
      <div className="flex h-32 items-end px-5 pb-4" style={{ background: '#0d211b' }} aria-hidden>
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
  if (slug === 'resa') {
    return (
      <div className="relative h-32" style={{ background: '#0f2a3d' }} aria-hidden>
        <svg viewBox="0 0 240 128" className="h-full w-full">
          <path
            d="M20 100 C 70 20, 150 20, 214 44"
            fill="none"
            stroke="#7fb4d9"
            strokeWidth="2"
            strokeDasharray="1 8"
            strokeLinecap="round"
          />
          <circle cx="20" cy="100" r="3.5" fill="#e8a13c" />
          <g transform="translate(214 44) rotate(24)">
            <path d="M0 0 L-13 5 L-10 0 L-13 -5 Z" fill="#ffffff" />
          </g>
        </svg>
      </div>
    );
  }
  return (
    <div className="relative flex h-32 items-center" style={{ background: '#15171c' }} aria-hidden>
      <svg viewBox="0 0 240 128" className="h-full w-full">
        <path d="M0 84 L240 64" stroke="#3a3f4a" strokeWidth="26" />
        <line
          x1="0"
          y1="84"
          x2="240"
          y2="64"
          stroke="#d9542b"
          strokeWidth="2.5"
          strokeDasharray="16 12"
        />
        <circle cx="178" cy="52" r="3" fill="#f4f4f2" />
        <circle cx="196" cy="50" r="3" fill="#f4f4f2" />
      </svg>
    </div>
  );
}
