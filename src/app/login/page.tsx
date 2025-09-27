'use client';

import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/common/logo';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user && !isRedirecting) {
      setIsRedirecting(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  }, [user, isUserLoading, router, isRedirecting]);

  if (isUserLoading || isRedirecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse transform scale-150">
            <Logo />
        </div>
      </div>
    );
  }
  
  // If user is already logged in but not redirecting yet (e.g. page refresh), show splash
  if (user) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse transform scale-150">
            <Logo />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
