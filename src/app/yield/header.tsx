'use client';

import { useDemoBase } from '@/lib/use-geena';

/**
 * Yield's masthead, two settings from the design contract: `inline` on the landing (roundel,
 * letterspaced wordmark, house nav) and `centered` on the application and welcome pages — the
 * stacked crest over a thin-thick rule, the way engraved stationery centers its mark.
 */
export function YieldHeader({ variant = 'inline' }: { variant?: 'inline' | 'centered' }) {
  const base = useDemoBase('yield');

  if (variant === 'centered') {
    return (
      <header className="border-b border-[color:var(--ink)]">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 py-5">
          <nav className="flex gap-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            <a href={`${base}/#funds`} className="hover:text-[color:var(--ink)]">
              Funds
            </a>
            <span className="hidden sm:inline">Approach</span>
          </nav>
          <a href={`${base}/`} className="block text-center">
            <span className="font-display mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--ink)] text-[20px] font-semibold">
              Y
            </span>
            <span className="font-display mt-2 block text-[22px] font-semibold uppercase tracking-[0.32em] [text-indent:0.32em]">
              Yield
            </span>
            <span className="mt-0.5 block text-[9px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
              Private index funds · Amsterdam
            </span>
          </a>
          <nav className="flex justify-end gap-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            <span className="hidden sm:inline">Letters</span>
            <a
              href={`${base}/apply`}
              className="text-[color:var(--ink)] underline underline-offset-4"
            >
              Open an account
            </a>
          </nav>
        </div>
        {/* The thin-thick closing rule of an engraved masthead. */}
        <div className="h-[3px] border-t border-[color:var(--ink)]" />
      </header>
    );
  }

  return (
    <header className="border-b border-[color:var(--ink)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <a href={`${base}/`} className="flex items-center gap-3">
          <span className="font-display flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[color:var(--ink)] text-[17px] font-semibold">
            Y
          </span>
          <span className="font-display text-[19px] font-semibold uppercase tracking-[0.3em]">
            Yield
          </span>
          <span className="hidden text-[9px] uppercase tracking-[0.24em] text-[color:var(--gold)] sm:inline">
            Private index funds · Amsterdam
          </span>
        </a>
        <nav className="flex gap-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          <a href={`${base}/#funds`} className="hover:text-[color:var(--ink)]">
            Funds
          </a>
          <span className="hidden sm:inline">Approach</span>
          <span className="hidden sm:inline">Letters</span>
        </nav>
      </div>
    </header>
  );
}
