
'use client';

import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const userInitial = user?.displayName?.[0] ?? user?.email?.[0];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            {isUserLoading ? (
              <Skeleton className="h-24 w-24 rounded-full" />
            ) : (
              <Avatar className="h-24 w-24 text-3xl">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                <AvatarFallback>
                  {userInitial ? userInitial.toUpperCase() : <UserIcon className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
            )}
            <CardTitle className="mt-4">
              {isUserLoading ? <Skeleton className="h-8 w-48" /> : (user?.displayName || 'Anonymous User')}
            </CardTitle>
            <CardDescription>
              {isUserLoading ? <Skeleton className="h-4 w-56 mt-1" /> : (user?.email || 'No email provided')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                {isUserLoading ? <Skeleton className="h-5 w-full" /> : <p className="text-sm truncate">{user?.uid}</p>}
             </div>
             <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                {isUserLoading ? <Skeleton className="h-5 w-1/2" /> : <p className="text-sm">{user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>}
             </div>
             <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Last Sign In</p>
                {isUserLoading ? <Skeleton className="h-5 w-1/2" /> : <p className="text-sm">{user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A'}</p>}
             </div>
             <div className="pt-4">
                <Button variant="outline" className="w-full" onClick={handleSignOut}>Sign Out</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
