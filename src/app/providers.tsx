'use client';

import { SpendWiseProvider } from '@/contexts/spendwise-context';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SpendWiseProvider>
      {children}
      <Toaster />
    </SpendWiseProvider>
  );
}
