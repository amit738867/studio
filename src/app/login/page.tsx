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
      router.replace('/combined-dashboard');
    }
  }, [user, isUserLoading, router]);
  
  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Award className="h-12 w-12 text-blue-400" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Welcome to Pramaan</h1>
          <p className="text-gray-400">Sign in to manage your certificates</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}