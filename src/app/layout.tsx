import type { Metadata } from 'next';
import { Fraunces, Inter, Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk' });

export const metadata: Metadata = {
  title: 'Geena demos',
  description:
    'Three fictional brands built on Connect with Geena: account opening, family travel insurance, passwordless car rental.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${fraunces.variable} ${manrope.variable} ${grotesk.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
