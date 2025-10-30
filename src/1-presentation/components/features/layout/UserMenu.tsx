/**
 * User Menu Component
 * Avatar dropdown with user info and actions
 */

'use client';

import React from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/presentation/components/ui/atoms/avatar';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/atoms/dropdown-menu';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { UserRole, UserRoleLabels } from '@/domain/enums/UserRole';

// =====================================================
// COMPONENT
// =====================================================
export function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case UserRole.MASTER_ADMIN:
        return 'destructive';
      case UserRole.CONSULTANT:
        return 'default';
      case UserRole.COMPANY_ADMIN:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <Badge variant={getRoleBadgeVariant(user.role)} className="w-fit text-xs">
              {UserRoleLabels[user.role as UserRole]}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Settings className="mr-2 h-4 w-4" />
          <span>Ayarlar</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Çıkış Yap</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
