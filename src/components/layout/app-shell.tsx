
'use client';

import {
  LayoutDashboard,
  WalletCards,
  Target,
  CalendarCheck,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/common/logo';
import { useAuth, useUser } from '@/firebase';
import { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';
import { SpendWiseProvider } from '@/contexts/spendwise-context';
import type { User } from 'firebase/auth';
import type { InitialData } from '@/lib/get-server-spendwise-data';

const menuItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/expenses',
    label: 'Expenses',
    icon: WalletCards,
  },
  {
    href: '/budgets',
    label: 'Budgets',
    icon: Target,
  },
  {
    href: '/plans',
    label: 'Future Plans',
    icon: CalendarCheck,
  },
];

function AppLayout({
  children,
  user,
  initialData,
}: {
  children: React.ReactNode;
  user: User | null;
  initialData: InitialData;
}) {
  const pathname = usePathname();
  const auth = useAuth();

  const handleSignOut = async () => {
    await auth.signOut();
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/profile'}
                  tooltip="Profile"
                >
                  <Link href="/profile">
                    <UserIcon />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div
          className="min-h-screen"
        >
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="sm:hidden" />
          </header>
          <main className="p-4 md:p-8">
            <div className="mx-auto max-w-screen-2xl rounded-lg border bg-background/80 backdrop-blur-sm">
              <SpendWiseProvider initialData={initialData}>
                {children}
              </SpendWiseProvider>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AppShell({ children, initialData }: { children: React.ReactNode, initialData: InitialData }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    );
  }

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (!user) {
    // This can happen briefly while the redirect is in flight.
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    );
  }

  return <AppLayout user={user} initialData={initialData}>{children}</AppLayout>;
}
