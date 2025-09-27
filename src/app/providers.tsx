'use client';

import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <Toaster />
    </>
  );
}
