import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { FirebaseClientProvider } from '@/firebase';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SpendWise',
  description: 'Smart budgeting and expense tracking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", fontInter.variable)}>
      <body suppressHydrationWarning>
        <FirebaseClientProvider>
          <Providers>{children}</Providers>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
