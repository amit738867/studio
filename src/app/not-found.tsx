import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          Sorry, the page you are looking for does not exist.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/combined-dashboard">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}