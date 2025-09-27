'use client';

import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User as UserIcon, Pencil, Save, X, Loader2, KeyRound, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { updateProfile, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  
  const isEmailProvider = auth.currentUser?.providerData.some(p => p.providerId === 'password');

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
            
            // Also update the user document in Firestore
            const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
            const userData = {
                displayName: displayName.trim(),
                email: auth.currentUser.email
            };
            setDocumentNonBlocking(userDocRef, userData, { merge: true });

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

  const handlePasswordReset = async () => {
    if (user?.email) {
      try {
        await sendPasswordResetEmail(auth, user.email);
        toast({
          title: 'Password Reset Email Sent',
          description: `An email has been sent to ${user.email} with instructions to reset your password.`,
        });
      } catch (error) {
        console.error('Error sending password reset email:', error);
        toast({
          variant: 'destructive',
          title: 'Request Failed',
          description: 'Could not send password reset email. Please try again later.',
        });
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (auth.currentUser) {
      try {
        await deleteUser(auth.currentUser);
        toast({
          title: 'Account Deleted',
          description: 'Your account has been permanently deleted.',
        });
        // The onAuthStateChanged listener in AppShell will handle the redirect to /login
      } catch (error) {
        console.error('Error deleting account:', error);
        toast({
          variant: 'destructive',
          title: 'Deletion Failed',
          description: 'There was an error deleting your account. Please sign out and sign back in to try again.',
        });
      }
    }
  };


  const userInitial = user?.displayName?.[0] ?? user?.email?.[0];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
      <div className="flex justify-center">
        <Card className="w-full max-w-lg">
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

                <Separator />

                <div className="space-y-2">
                    <h3 className="font-semibold">Account Management</h3>
                    <div className='flex flex-col sm:flex-row gap-2'>
                        <Button variant="outline" onClick={handlePasswordReset} disabled={!isEmailProvider}>
                            <KeyRound className='mr-2 h-4 w-4'/>
                            Reset Password
                        </Button>
                        
                        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <ShieldAlert className="mr-2 h-4 w-4" />
                                    Delete Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your account and all associated data from our servers.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                                    Delete My Account
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                     {!isEmailProvider && (
                        <p className="text-xs text-muted-foreground pt-1">
                            Password reset is only available for accounts created with email and password.
                        </p>
                    )}
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
