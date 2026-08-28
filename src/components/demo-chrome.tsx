'use client';

import type { DemoSlug } from '@/lib/demos';
import { useHubHref } from '@/lib/use-geena';
import { BackstageDrawer } from './backstage-drawer';

/**
 * The shared page tail, restyled per the design contract: a minimal right-aligned footer nav
 * (each brand sets its own typography via .site-footer-nav) and the backstage drawer. The
 * fictional-brand disclaimers now live in the pages' own fine print, where the design put them.
 */
export function DemoChrome({ demo }: { demo: DemoSlug }) {
  const hub = useHubHref();
  return (
    <>
      <footer
        className="mt-12 border-t border-[color:var(--line)]"
        style={{ background: 'var(--footer-bg, transparent)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-end px-6 py-6">
          <nav className="site-footer-nav">
            <a href={hub}>The journey</a>
            <a href="https://github.com/Identa-io/demo">Source</a>
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
