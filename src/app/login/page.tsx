'use client';

import { useRouter } from 'next/navigation';
import { Award } from 'lucide-react';
import { AuthForm } from '@/components/auth/auth-form';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);
  
  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Award className="h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Welcome to CertifyAI</h1>
          <p className="text-muted-foreground">Sign in to manage your certificates</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
