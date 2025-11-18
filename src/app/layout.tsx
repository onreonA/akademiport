import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/5-shared/providers/theme-provider';
import { QueryProvider } from '@/5-shared/providers/query-provider';
import { NotificationProvider } from '@/5-shared/contexts/NotificationContext';
import { ServiceWorkerRegistration } from '@/1-presentation/components/features/notifications/ServiceWorkerRegistration';
import { AnalyticsProvider } from '@/5-shared/components/AnalyticsProvider';
import { PerformanceTracker } from '@/1-presentation/components/shared/PerformanceTracker';
import { Toaster } from '@/1-presentation/components/ui/molecules/sonner';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Akademi Port - E-İhracat Dönüşüm Platformu',
  description: 'Multi-program e-ihracat dönüşüm platformu',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AnalyticsProvider>
              <PerformanceTracker />
              <NotificationProvider>
                <ServiceWorkerRegistration />
                {children}
                <Toaster />
              </NotificationProvider>
            </AnalyticsProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
