import type { Metadata } from 'next';
import { DemoChrome } from '@/components/demo-chrome';
import { VagnHeader } from './header';

export const metadata: Metadata = {
  title: 'Vagn — car rental',
  description: 'A Geena demo: rent a car with a real account and no password, ever.',
};

export default function VagnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-demo="vagn" className="min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]">
      <VagnHeader />
      {children}
      <DemoChrome demo="vagn" />
    </div>
  );
}
