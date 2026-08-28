import type { Metadata } from 'next';
import { DemoChrome } from '@/components/demo-chrome';
import { JourneyBar } from '@/components/journey-bar';

export const metadata: Metadata = {
  title: 'Yield — private index funds',
  description:
    'A Geena demo: KYC-grade account opening where you type everything once — into your vault.',
};

/** Pages render their own masthead (the design gives the application its own centered crest). */
export default function YieldLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-demo="yield"
      className="flex min-h-screen flex-col bg-[color:var(--bg)] text-[color:var(--ink)]"
    >
      <JourneyBar demo="yield" />
      {children}
      <DemoChrome demo="yield" />
    </div>
  );
}
