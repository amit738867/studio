'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { LogOut, User as UserIcon } from 'lucide-react';

export function UserNav() {
  const auth = useAuth();
  const { user } = useUser();

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };

  if (!user) {
    return null;
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
             <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
            <AvatarFallback className="bg-gray-700 text-white">{getInitials(user.displayName) || <UserIcon />}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">{user.displayName}</p>
            <p className="text-xs leading-none text-gray-400">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuGroup>
          <DropdownMenuItem className="text-gray-300 hover:bg-gray-700 hover:text-white">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem onClick={handleLogout} className="text-gray-300 hover:bg-gray-700 hover:text-white">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}