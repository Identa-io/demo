import type { Metadata } from 'next';
import { DemoChrome } from '@/components/demo-chrome';
import { NyckelHeader } from './header';

export const metadata: Metadata = {
  title: 'Nyckel — apartments, no password',
  description: 'A Geena demo: Geena as the entire login stack.',
};

export default function NyckelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-demo="nyckel" className="min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]">
      <NyckelHeader />
      {children}
      <DemoChrome demo="nyckel" />
    </div>
  );
}
