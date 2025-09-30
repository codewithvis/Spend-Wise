'use client';

import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from '@/components/ui/toaster';
import type { InitialData } from '@/lib/get-server-spendwise-data';

export function Providers({ children, initialData }: { children: React.ReactNode, initialData: InitialData }) {
  return (
    <>
      <AppShell initialData={initialData}>{children}</AppShell>
      <Toaster />
    </>
  );
}
