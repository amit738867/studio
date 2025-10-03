'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, LayoutDashboard, Users, FileText, Send, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/dashboard',
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
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Award className="w-6 h-6 text-primary" />
        <span className="text-lg font-semibold">CertifyAI</span>
      </div>
      <nav className="hidden md:flex items-center gap-5 text-sm font-medium mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-muted-foreground transition-colors hover:text-foreground',
              pathname.startsWith(item.href) && 'text-foreground'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4 ml-auto">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  );
}
