import type { Metadata } from 'next';
import { DemoChrome } from '@/components/demo-chrome';

export const metadata: Metadata = {
  title: 'Resa — travel insurance',
  description: 'A Geena demo: cover for you and your children, without the child 1 / child 2 forms.',
};

export default function ResaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-demo="resa" className="min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]">
      <header className="border-b border-[color:var(--line)] bg-[color:var(--card)]/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold text-white"
              style={{ background: 'var(--accent)' }}
            >
              R
            </span>
            <span className="font-display text-[19px] font-bold tracking-tight">Resa</span>
            <span className="mt-0.5 hidden text-[11px] font-medium text-[color:var(--muted)] sm:block">
              travel insurance
            </span>
          </div>
          <p className="hidden text-[12px] text-[color:var(--muted)] md:block">
            Underwritten by nobody — Resa is a fictional insurer in a Geena demo.
          </p>
        </div>
      </header>
      {children}
      <DemoChrome demo="resa" />
    </div>
  );
}
