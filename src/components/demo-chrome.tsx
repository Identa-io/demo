import type { DemoSlug } from '@/lib/demos';
import { DEMOS } from '@/lib/demos';
import { BackstageDrawer } from './backstage-drawer';

/**
 * The neutral Geena chrome every demo shares (brand ≠ chrome): the fictional-brand disclaimer,
 * the way back to the gallery, and the backstage drawer.
 */
export function DemoChrome({ demo }: { demo: DemoSlug }) {
  return (
    <>
      <footer
        className="mx-auto mt-16 max-w-5xl px-6 pb-24 text-center text-[11px]"
        style={{ color: 'var(--muted)', fontFamily: 'var(--font-inter)' }}
      >
        <p>
          {DEMOS[demo].name} is a fictional brand — a Geena demo. Nothing here is a real shop,
          club, or landlord; no payment happens and no data is stored beyond your demo session.
        </p>
        <p className="mt-1">
          <a href="/" className="underline underline-offset-2 hover:opacity-80">
            All Geena demos
          </a>
        </p>
      </footer>
      <BackstageDrawer demo={demo} />
    </>
  );
}

/** The honest connection banner used across demos for the non-happy states. */
export function StateNotice({
  tone,
  children,
}: {
  tone: 'info' | 'ended' | 'denied';
  children: React.ReactNode;
}) {
  const palette =
    tone === 'ended'
      ? 'border-red-200 bg-red-50 text-red-800'
      : tone === 'denied'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-[color:var(--line)] bg-[color:var(--card)] text-[color:var(--ink)]';
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-[13px] leading-relaxed ${palette}`}
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      {children}
    </div>
  );
}
