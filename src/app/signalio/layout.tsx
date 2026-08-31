import type { Metadata } from 'next';
import { DemoChrome } from '@/components/demo-chrome';
import { JourneyBar } from '@/components/journey-bar';

export const metadata: Metadata = {
  title: 'Signalio — market intelligence',
  description:
    'A Geena demo: a subscription that starts with one consent screen and zero typing.',
};

export default function SignalioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-demo="signalio"
      className="min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]"
    >
      <JourneyBar demo="signalio" />
      <header className="border-b border-[color:var(--line)] bg-[color:var(--card)]/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-md text-[13px] font-bold text-white"
              style={{ background: 'var(--accent)' }}
            >
              S
            </span>
            <span className="font-display text-[19px] font-bold tracking-tight">Signalio</span>
            <span className="mt-0.5 hidden text-[11px] font-medium text-[color:var(--muted)] sm:block">
              market intelligence
            </span>
          </div>
          <p className="hidden text-[12px] text-[color:var(--muted)] md:block">
            Researched by nobody — Signalio is a fictional publisher in a Geena demo.
          </p>
        </div>
      </header>
      {children}
      <DemoChrome demo="signalio" />
    </div>
  );
}
