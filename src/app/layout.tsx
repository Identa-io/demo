import type { Metadata } from 'next';
import {
  Cormorant_Garamond,
  IBM_Plex_Mono,
  Inter,
  JetBrains_Mono,
  Public_Sans,
  Space_Grotesk,
  Spectral,
} from 'next/font/google';
import './globals.css';

/**
 * One deployable, three typographic worlds: Yield speaks engraved serif (Cormorant display,
 * Spectral text, Plex Mono figures), Signalio speaks terminal grotesk (Space Grotesk, JetBrains
 * Mono), Cover speaks boarding pass (Public Sans, Plex Mono). Inter is the neutral Geena chrome.
 */
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jbmono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});
const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
});
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk' });
const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-public' });
const plexmono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plexmono',
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
        className={`${inter.variable} ${jbmono.variable} ${cormorant.variable} ${spectral.variable} ${grotesk.variable} ${publicSans.variable} ${plexmono.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
