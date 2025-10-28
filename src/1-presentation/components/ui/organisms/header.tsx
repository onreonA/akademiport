import * as React from 'react';
import { cn } from '@/presentation/lib/utils';
import { Button } from '../atoms/button';
import { Menu, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../atoms/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../atoms/dropdown-menu';

export interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  className?: string;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  (
    {
      title = 'Akademi Port',
      onMenuClick,
      showMenuButton = true,
      user,
      onProfileClick,
      onSettingsClick,
      onLogoutClick,
      className,
    },
    ref
  ) => {
    const initials = user?.name
      ? user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'U';

    return (
      <header
        ref={ref}
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          className
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {showMenuButton && (
              <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Toggle menu">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onProfileClick}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={onSettingsClick}>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogoutClick}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
    );
  }
);
Header.displayName = 'Header';

export { Header };
