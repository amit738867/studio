'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Something went wrong!</h1>
        <p className="text-gray-400 mb-8">
          An error occurred while loading the page. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try again
          </Button>
          <Button asChild variant="secondary" className="bg-gray-700 hover:bg-gray-600">
            <Link href="/combined-dashboard">Go back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}