'use client';

import { useDemoBase } from '@/lib/use-geena';

export function BlommaHeader() {
  const base = useDemoBase('blomma');
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
      <a href={`${base}/`} className="font-display text-2xl font-semibold tracking-tight">
        Blomma<span className="text-[color:var(--accent)]">.</span>
      </a>
      <nav className="flex items-center gap-5 text-[13px] font-medium">
        <a href={`${base}/`} className="hover:opacity-70">
          Shop
        </a>
        <a
          href={`${base}/checkout`}
          className="rounded-full border border-[color:var(--ink)]/20 px-4 py-1.5 hover:border-[color:var(--ink)]/50"
        >
          Checkout
        </a>
      </nav>
    </header>
  );
}
