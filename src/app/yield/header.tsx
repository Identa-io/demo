'use client';

import { useDemoBase } from '@/lib/use-geena';

export function YieldHeader() {
  const base = useDemoBase('yield');
  return (
    <header className="border-b border-[color:var(--line)] bg-[color:var(--card)]/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href={`${base}/`} className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-md text-[13px] font-bold text-white"
            style={{ background: 'var(--ink)' }}
          >
            Y
          </span>
          <span className="font-display text-[19px] font-semibold tracking-tight">Yield</span>
        </a>
        <nav className="flex items-center gap-6 text-[13px] font-medium">
          <a
            href={`${base}/#funds`}
            className="hidden text-[color:var(--muted)] hover:text-[color:var(--ink)] sm:block"
          >
            Funds
          </a>
          <a
            href={`${base}/#pricing`}
            className="hidden text-[color:var(--muted)] hover:text-[color:var(--ink)] sm:block"
          >
            Pricing
          </a>
          <a href={`${base}/apply`} className="btn-primary">
            Open an account
          </a>
        </nav>
      </div>
    </header>
  );
}
