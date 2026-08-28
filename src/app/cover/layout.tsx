import type { Metadata } from 'next';
import { DemoChrome } from '@/components/demo-chrome';
import { JourneyBar } from '@/components/journey-bar';

export const metadata: Metadata = {
  title: 'Cover — travel insurance',
  description:
    'A Geena demo: you flow in from the vault, the children are the only thing new — plus a file slot with a discount attached.',
};

export default function CoverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-demo="cover" className="min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]">
      <JourneyBar demo="cover" />
      <header className="border-b border-[color:var(--line)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-extrabold text-white"
              style={{ background: 'var(--accent)' }}
            >
              C
            </span>
            <span className="text-[19px] font-extrabold tracking-tight">Cover</span>
            <span className="font-mono text-[10px] tracking-[0.1em] text-[color:var(--mono-muted)]">
              TRAVEL INSURANCE
            </span>
          </div>
        </div>
      </header>
      {children}
      <DemoChrome demo="cover" />
    </div>
  );
}
