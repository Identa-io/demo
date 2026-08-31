import type { Metadata } from 'next';
import { DemoChrome } from '@/components/demo-chrome';
import { JourneyBar } from '@/components/journey-bar';
import { YieldHeader } from './header';

export const metadata: Metadata = {
  title: 'Yield — long-term investing',
  description: 'A Geena demo: KYC-grade account opening where you type everything once — into your vault.',
};

export default function YieldLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-demo="yield" className="min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]">
      <JourneyBar demo="yield" />
      <YieldHeader />
      {children}
      <DemoChrome demo="yield" />
    </div>
  );
}
