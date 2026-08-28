'use client';

import type { DemoSlug } from '@/lib/demos';
import { DEMOS } from '@/lib/demos';
import { useHubHref } from '@/lib/use-geena';
import { BackstageDrawer } from './backstage-drawer';

/**
 * The neutral Geena chrome every demo shares (brand ≠ chrome): a slim disclaimer bar, the way
 * back to the journey hub, and the backstage drawer.
 */
export function DemoChrome({ demo }: { demo: DemoSlug }) {
  const hub = useHubHref();
  return (
    <>
      <footer
        className="mt-16 border-t border-[color:var(--line)]"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-[11px] text-[color:var(--muted)] sm:flex-row">
          <p>
            {DEMOS[demo].name} is a fictional brand — chapter {DEMOS[demo].chapter} of a{' '}
            <span className="font-semibold">Geena demo journey</span>. Nothing is sold, stored or
            underwritten here.
          </p>
          <nav className="flex items-center gap-4">
            <a href={hub} className="hover:text-[color:var(--ink)]">
              The journey
            </a>
            <a href="https://github.com/Identa-io/demo" className="hover:text-[color:var(--ink)]">
              Source
            </a>
          </nav>
        </div>
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
      ? 'border-red-200 bg-red-50 text-red-900'
      : tone === 'denied'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
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
