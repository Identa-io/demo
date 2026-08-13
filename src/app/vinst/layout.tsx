import type { Metadata } from 'next';
import { DemoChrome } from '@/components/demo-chrome';
import { VinstHeader } from './header';

export const metadata: Metadata = {
  title: 'Vinst — index funds for the Nordics',
  description: 'A Geena demo: account opening where the KYC form writes itself.',
};

export default function VinstLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-demo="vinst" className="min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]">
      <VinstHeader />
      {children}
      <DemoChrome demo="vinst" />
    </div>
  );
}
