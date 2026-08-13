'use client';

import { useDemoBase } from '@/lib/use-geena';

export function VagnHeader() {
  const base = useDemoBase('vagn');
  return (
    <header style={{ background: 'var(--ink)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-white">
        <a href={`${base}/`} className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-md text-[13px] font-bold"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            V
          </span>
          <span className="font-display text-[18px] font-bold uppercase tracking-[0.18em]">
            Vagn
          </span>
        </a>
        <nav className="flex items-center gap-6 text-[13px] font-medium">
          <a href={`${base}/`} className="text-white/70 hover:text-white">
            Fleet
          </a>
          <a
            href={`${base}/account`}
            className="rounded-lg border border-white/25 px-3.5 py-1.5 hover:border-white/60"
          >
            Account
          </a>
        </nav>
      </div>
    </header>
  );
}
