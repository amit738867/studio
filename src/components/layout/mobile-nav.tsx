'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/combined-dashboard',
    label: 'Dashboard',
  },
  {
    href: '/participants',
    label: 'Participants',
  },
  {
    href: '/templates',
    label: 'Templates',
  },
  {
    href: '/campaigns',
    label: 'Campaigns',
  },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-300 hover:text-white"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-gray-900 border-b border-gray-800 p-4 z-50">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-gray-300 py-2 px-4 rounded-md transition-colors',
                  pathname.startsWith(item.href) 
                    ? 'bg-gray-800 text-white font-medium' 
                    : 'hover:bg-gray-800 hover:text-white'
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}