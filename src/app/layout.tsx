import type { Metadata } from 'next';
import {
  Archivo_Black,
  Fraunces,
  Inter,
  Manrope,
  Space_Grotesk,
} from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk' });
const archivo = Archivo_Black({ subsets: ['latin'], weight: '400', variable: '--font-archivo' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: 'Geena demos',
  description:
    'Three fictional brands showing Connect with Geena: autofill, family data, passwordless login.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${fraunces.variable} ${grotesk.variable} ${archivo.variable} ${manrope.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
