import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1" />
      <Button variant="ghost" size="icon">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Notifications</span>
      </Button>
    </header>
  );
}
