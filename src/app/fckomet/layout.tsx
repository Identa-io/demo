import type { Metadata } from 'next';
import { DemoChrome } from '@/components/demo-chrome';

export const metadata: Metadata = {
  title: 'FC Komet — youth football',
  description: 'A Geena demo: register your children without child 1 / child 2 forms.',
};

export default function FcKometLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-demo="fckomet" className="min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]">
      {children}
      <DemoChrome demo="fckomet" />
    </div>
  );
}
