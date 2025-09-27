'use client';

import { useState, useEffect }from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/firebase';
import { initiateEmailSignUp, initiateEmailSignIn, initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import type { FirebaseError } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  name: z.string().optional(),
});

const signupSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    name: z.string().min(2, { message: 'Name must be at least 2 characters.'}),
});

const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
});


export function AuthForm() {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'resetPassword'>('login');
  const auth = useAuth();
  const { toast } = useToast();
  
  const isLogin = authMode === 'login';
  const isSignup = authMode === 'signup';
  const isResetPassword = authMode === 'resetPassword';

  const currentSchema = isLogin ? loginSchema : isSignup ? signupSchema : resetPasswordSchema;

  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  useEffect(() => {
    form.reset({
        email: '',
        password: '',
        name: '',
    });
  }, [authMode, form]);

  const handleAuthError = (error: FirebaseError) => {
    let title = 'Authentication Error';
    let description = 'An unexpected error occurred. Please try again.';

    switch (error.code) {
        case 'auth/email-already-in-use':
            title = 'Sign-up Failed';
            description = 'This email is already registered. Please try signing in.';
            break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            title = 'Sign-in Failed';
            description = 'Invalid email or password. Please check your credentials.';
            break;
        case 'auth/weak-password':
            title = 'Sign-up Failed';
            description = 'The password is too weak. It must be at least 6 characters long.';
            break;
    }

    toast({
        variant: 'destructive',
        title: title,
        description: description,
    });
  };
  
  const handlePasswordReset = async (data: z.infer<typeof resetPasswordSchema>) => {
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast({
        title: 'Password Reset Email Sent',
        description: `An email has been sent to ${data.email} with instructions to reset your password.`,
      });
      setAuthMode('login');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description: 'Could not send password reset email. Please make sure the email address is correct.',
      });
    }
  };

  const onSubmit = (data: z.infer<typeof currentSchema>) => {
    if (isLogin) {
      initiateEmailSignIn(auth, data.email, data.password, handleAuthError);
    } else if (isSignup) {
      initiateEmailSignUp(auth, data.email, data.password, data.name, handleAuthError);
    } else if (isResetPassword) {
      handlePasswordReset(data);
    }
  };
  
  const handleAnonymousSignIn = () => {
    initiateAnonymousSignIn(auth, handleAuthError);
  };

  const getTitle = () => {
    if (isLogin) return 'Welcome Back';
    if (isSignup) return 'Create Account';
    return 'Reset Password';
  };

  const getDescription = () => {
    if (isLogin) return 'Sign in to access your dashboard.';
    if (isSignup) return 'Enter your details to get started.';
    return 'Enter your email to receive a password reset link.';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isSignup && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(isLogin || isSignup) && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isLogin && (
                <div className="text-right">
                    <Button variant="link" size="sm" type="button" onClick={() => setAuthMode('resetPassword')} className="px-0 h-auto">
                        Forgot Password?
                    </Button>
                </div>
            )}
            
            <Button type="submit" className="w-full">
              {isLogin ? 'Sign In' : isSignup ? 'Sign Up' : 'Send Reset Link'}
            </Button>
          </form>
        </Form>

        {!isResetPassword && (
          <>
            <div className="mt-4 text-center text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <Button variant="link" onClick={() => setAuthMode(isLogin ? 'signup' : 'login')} className="px-1">
                {isLogin ? 'Sign up' : 'Sign in'}
              </Button>
            </div>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleAnonymousSignIn}>
              Sign in Anonymously
            </Button>
          </>
        )}

        {isResetPassword && (
            <div className="mt-4 text-center text-sm">
                Remember your password?
                <Button variant="link" onClick={() => setAuthMode('login')} className="px-1">
                    Sign in
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
