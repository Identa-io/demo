'use client';

import { useDemoBase } from '@/lib/use-geena';

export function NyckelHeader() {
  const base = useDemoBase('nyckel');
  return (
    <header className="border-b border-[color:var(--line)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <a
          href={`${base}/`}
          className="font-display text-lg font-extralight uppercase tracking-[0.35em]"
        >
          Nyckel
        </a>
        <nav className="flex items-center gap-6 text-[13px]">
          <a href={`${base}/`} className="hover:opacity-60">
            Listings
          </a>
          <a href={`${base}/account`} className="hover:opacity-60">
            Account
          </a>
        </nav>
      </div>
    </header>
  );
}
