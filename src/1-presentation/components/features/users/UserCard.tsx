/**
 * User Card Component
 *
 * Displays user summary information in a card format
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { User } from '@/domain/entities/User';
import { UserRoleLabels } from '@/domain/enums/UserRole';
import { Mail, Phone, Building2, Eye, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/presentation/lib/utils';

export interface UserCardProps {
  user: User;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  showActions?: boolean;
  className?: string;
}

export const UserCard = React.forwardRef<HTMLDivElement, UserCardProps>(
  ({ user, onView, onEdit, onDelete, showActions = true, className }, ref) => {
    // Get initials for avatar fallback
    const initials = user.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // Role badge variant
    const getRoleBadgeVariant = (role: string) => {
      switch (role) {
        case 'master_admin':
          return 'destructive';
        case 'program_manager':
          return 'default';
        case 'consultant':
          return 'secondary';
        case 'company_admin':
          return 'outline';
        default:
          return 'outline';
      }
    };

    return (
      <Card
        ref={ref}
        className={cn(
          'group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-card to-card/50',
          className
        )}
      >
        <CardContent className="pt-6">
          {/* Avatar & Name */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-16 h-16 rounded-full object-cover shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
                  <span className="text-lg font-semibold text-primary">{initials}</span>
                </div>
              )}
              {/* Active status indicator */}
              <div
                className={cn(
                  'absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background',
                  user.isActive ? 'bg-green-500' : 'bg-gray-400'
                )}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                {user.fullName}
              </h3>
              <Badge
                variant={getRoleBadgeVariant(user.role)}
                className="mt-1 font-medium px-3 py-1"
              >
                {UserRoleLabels[user.role]}
              </Badge>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-4 space-y-3">
            {user.email && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-950">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium truncate">{user.email}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-950">
                  <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium">{user.phone}</span>
              </div>
            )}
            {user.companyId && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-950">
                  <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-medium">Firmaya Bağlı</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
          )}

          {/* Expertise Areas */}
          {user.expertiseAreas && user.expertiseAreas.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {user.expertiseAreas.slice(0, 3).map((area, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
              {user.expertiseAreas.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{user.expertiseAreas.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        {/* Actions */}
        {showActions && (
          <CardFooter className="flex gap-2 pt-4">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(user)}
                className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Eye className="h-4 w-4 mr-1" />
                Görüntüle
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(user)}
                className="flex-1 hover:bg-secondary transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                Düzenle
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(user)}
                className="hover:bg-destructive/90 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    );
  }
);

UserCard.displayName = 'UserCard';
