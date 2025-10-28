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
      <Card ref={ref} className={cn('hover:shadow-lg transition-shadow', className)}>
        <CardContent className="pt-6">
          {/* Avatar & Name */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
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
              <h3 className="font-semibold text-lg truncate">{user.fullName}</h3>
              <Badge variant={getRoleBadgeVariant(user.role)} className="mt-1">
                {UserRoleLabels[user.role]}
              </Badge>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-4 space-y-2">
            {user.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.companyId && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 flex-shrink-0" />
                <span>Firmaya Bağlı</span>
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
          <CardFooter className="flex gap-2 pt-0">
            {onView && (
              <Button variant="outline" size="sm" onClick={() => onView(user)} className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                Görüntüle
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(user)} className="flex-1">
                <Edit className="h-4 w-4 mr-1" />
                Düzenle
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(user)}
                className="text-destructive hover:text-destructive"
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
