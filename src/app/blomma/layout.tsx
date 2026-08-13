import type { Metadata } from 'next';
import { DemoChrome } from '@/components/demo-chrome';
import { BlommaHeader } from './header';

export const metadata: Metadata = {
  title: 'Blomma — fresh flowers, no account',
  description: 'A Geena demo: checkout that fills itself.',
};

export default function BlommaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-demo="blomma" className="min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]">
      <BlommaHeader />
      {children}
      <DemoChrome demo="blomma" />
    </div>
  );
}
