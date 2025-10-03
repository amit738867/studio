'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Send, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserNav } from './user-nav';
import { MobileNav } from './mobile-nav';
import { Logo } from './logo';

const navItems = [
  {
    href: '/combined-dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    href: '/participants',
    icon: Users,
    label: 'Participants',
  },
  {
    href: '/templates',
    icon: FileText,
    label: 'Templates',
  },
  {
    href: '/campaigns',
    icon: Send,
    label: 'Campaigns',
  },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-800 bg-gray-900 px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Logo />
      </div>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-5 text-sm font-medium mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-gray-400 transition-colors hover:text-white',
              pathname.startsWith(item.href) && 'text-white font-medium'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNav />
      </div>
      
      <div className="flex items-center gap-4 ml-auto">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hidden md:flex">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        <UserNav />
      </div>
    </header>
  );
}