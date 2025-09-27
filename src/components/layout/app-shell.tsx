'use client';

import {
  LayoutDashboard,
  WalletCards,
  Target,
  CalendarCheck,
  LogOut,
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
  }
];

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();
  
  const handleSignOut = async () => {
    await auth.signOut();
  };

  return (
     <SidebarProvider>
      <Sidebar>
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
                <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
                  <LogOut />
                  <span>Sign Out</span>
                </SidebarMenuButton>
             </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/seed/finance/1920/1080')"}} data-ai-hint="finance background">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
        </header>
        <main className="bg-background/80 backdrop-blur-sm">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}


export function AppShell({ children }: { children: React.ReactNode }) {
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
    )
  }
  
  if (pathname === '/login') {
    return <>{children}</>;
  }

  if(!user) {
    // This can happen briefly while the redirect is in flight.
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    )
  }


  return (
    <SpendWiseProvider>
      <AppLayout>{children}</AppLayout>
    </SpendWiseProvider>
  );
}
