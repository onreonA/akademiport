import type { Metadata } from 'next';
import { Inter, Pacifico } from 'next/font/google';

import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/lib/components/error-boundary';
import './globals.css';
const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
});
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});
export const metadata: Metadata = {
  title:
    "Akademi Port - Türkiye'nin E-İhracat Kapasitesini Birlikte Yükseltiyoruz",
  description:
    'Ticaret Bakanlığı destekleriyle, sanayi ve ticaret odalarının organizasyonunda yürütülen e-ihracat dönüşüm programı',
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='tr' suppressHydrationWarning={true}>
      <body className={`${inter.variable} ${pacifico.variable} antialiased`}>
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
