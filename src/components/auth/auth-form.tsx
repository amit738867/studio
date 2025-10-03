'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
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
import { useAuth } from '@/firebase';
import {
  initiateEmailSignUp,
  initiateEmailSignIn,
  initiateGoogleSignIn,
} from '@/firebase/auth-operations';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function AuthForm() {
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleEmailAuth = async (data: FormValues, action: 'signIn' | 'signUp') => {
    if (!auth) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      if (action === 'signUp') {
        await initiateEmailSignUp(auth, data.email, data.password);
      } else {
        await initiateEmailSignIn(auth, data.email, data.password);
      }
      // On success, the onAuthStateChanged listener will handle the redirect.
    } catch (error: any) {
      setAuthError(error.message);
      setIsSubmitting(false); // Reset on error
    }
  };

  const handleGoogleAuth = async () => {
    if (!auth) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await initiateGoogleSignIn(auth);
      // On success, the onAuthStateChanged listener will handle the redirect.
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled. Please try again.');
      } else {
        setAuthError(error.message || 'An error occurred during Google sign-in.');
      }
      setIsSubmitting(false); // Reset button state on failure
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    {...field}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="******" 
                    type="password" 
                    {...field} 
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {authError && (
            <p className="text-sm text-red-400">{authError}</p>
          )}
          <div className="flex flex-col gap-2 md:flex-row">
            <Button
              type="button"
              onClick={form.handleSubmit(d => handleEmailAuth(d, 'signIn'))}
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={form.handleSubmit(d => handleEmailAuth(d, 'signUp'))}
              disabled={isSubmitting}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </div>
        </form>
      </Form>
      <div className="flex items-center gap-4">
        <Separator className="flex-1 bg-gray-700" />
        <span className="text-xs text-gray-400">OR</span>
        <Separator className="flex-1 bg-gray-700" />
      </div>
      <Button
        variant="outline"
        onClick={handleGoogleAuth}
        disabled={isSubmitting}
        className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg
            className="mr-2 h-4 w-4"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 12.8C34.661 8.807 29.614 6 24 6C12.955 6 4 14.955 4 26s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="M6.306 14.691c2.129-3.763 5.922-6.43 10.394-7.448L12.8 3.341C6.932 5.803 2.56 10.966.926 17.659l5.38 3.991z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238c-2.008 1.32-4.402 2.13-7.219 2.13c-4.387 0-8.1-2.483-9.886-6.012l-6.052 4.619C9.513 39.462 16.225 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.16-4.087 5.571l6.19 5.238C42.022 35.822 44 31.13 44 26c0-1.341-.138-2.65-.389-3.917z"
            />
          </svg>
        )}
        Sign In with Google
      </Button>
    </div>
  );
}