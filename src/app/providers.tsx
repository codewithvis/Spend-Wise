'use client';

import { SpendWiseProvider } from '@/contexts/spendwise-context';
import { Toaster } from '@/components/ui/toaster';
import { AppShell } from '@/components/layout/app-shell';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SpendWiseProvider>
      <AppShell>{children}</AppShell>
      <Toaster />
    </SpendWiseProvider>
  );
}
