
'use client';

import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User as UserIcon, Pencil, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || 'Anonymous User');
    }
  }, [user]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const handleSave = async () => {
    if (auth.currentUser && displayName.trim()) {
        setIsSaving(true);
        try {
            await updateProfile(auth.currentUser, { displayName: displayName.trim() });
            toast({
                title: 'Profile Updated',
                description: 'Your name has been successfully updated.',
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'There was an error updating your profile.',
            });
        } finally {
            setIsSaving(false);
        }
    }
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
            <CardTitle className="mt-4 flex items-center gap-2">
              {isUserLoading ? <Skeleton className="h-8 w-48" /> : (
                isEditing ? (
                  <Input 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="text-2xl font-semibold text-center h-auto p-0 border-0 focus-visible:ring-0"
                  />
                ) : (
                  <span>{displayName}</span>
                )
              )}
            </CardTitle>
            <CardDescription>
              {isUserLoading ? <Skeleton className="h-4 w-56 mt-1" /> : (user?.email || 'No email provided')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-center gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => { setIsEditing(false); setDisplayName(user?.displayName || 'Anonymous User')}}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
              <div className="border-t pt-4 space-y-4">
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
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
