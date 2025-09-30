import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { FirebaseClientProvider } from '@/firebase';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { getServerSpendWiseData } from '@/lib/get-server-spendwise-data';

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SpendWise',
  description: 'Smart budgeting and expense tracking.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialData = await getServerSpendWiseData();

  return (
    <html lang="en" className={cn("dark", fontInter.variable)} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <FirebaseClientProvider>
          <Providers initialData={initialData}>{children}</Providers>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
