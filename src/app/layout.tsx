import type { Metadata } from 'next';
import { Fraunces, Inter, JetBrains_Mono, Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
});
// The suite's provenance voice: anything served from the vault or the protocol speaks mono.
const jbmono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jbmono',
});

export const metadata: Metadata = {
  title: 'Geena journey',
  description:
    'One journey, three fictional brands built on Connect with Geena: type your data once (Yield), reuse it with zero typing (Signalio), then family subjects and file slots (Cover).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${fraunces.variable} ${manrope.variable} ${grotesk.variable} ${jbmono.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
