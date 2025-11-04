/**
 * User Card Component
 *
 * Modern, elegant card design inspired by akademiport.com
 * Consistent layout with fixed button positions
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { User } from '@/domain/entities/User';
import { UserRoleLabels } from '@/domain/enums/UserRole';
import { Mail, Phone, Building2, Eye } from 'lucide-react';
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

    const formatShortDate = (date: Date) => {
      return new Date(date).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    // Role badge colors
    const getRoleBadgeColors = (role: string) => {
      switch (role) {
        case 'master_admin':
          return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
        case 'program_manager':
          return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        case 'consultant':
          return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
        case 'company_admin':
          return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
        default:
          return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700';
      }
    };

    return (
      <Card
        ref={ref}
        className={cn(
          'group flex flex-col h-full hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary/30 dark:hover:border-primary/30',
          className
        )}
      >
        {/* Header with Badges */}
        <CardHeader className="pb-3 space-y-3">
          {/* Avatar & Name */}
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-semibold text-primary">{initials}</span>
                </div>
              )}
              {/* Active status indicator */}
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900',
                  user.isActive ? 'bg-green-500' : 'bg-gray-400'
                )}
              />
            </div>

            {/* Name and Role */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                {onView ? (
                  <button
                    onClick={() => onView(user)}
                    className="hover:text-primary transition-colors text-left"
                  >
                    {user.fullName}
                  </button>
                ) : (
                  user.fullName
                )}
              </CardTitle>
              <Badge
                className={`${getRoleBadgeColors(user.role)} border font-medium px-2 py-0.5 mt-1.5 text-xs`}
              >
                {UserRoleLabels[user.role]}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Content - Flex container for consistent button placement */}
        <CardContent className="flex-1 flex flex-col pt-0 pb-4 space-y-3">
          {/* Contact Info */}
          <div className="space-y-2">
            {user.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 truncate">{user.email}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{user.phone}</span>
              </div>
            )}
            {user.companyId && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Firmaya Bağlı</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* Expertise Areas */}
          {user.expertiseAreas && user.expertiseAreas.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {user.expertiseAreas.slice(0, 3).map((area, index) => (
                <Badge key={index} variant="secondary" className="text-xs font-medium">
                  {area}
                </Badge>
              ))}
              {user.expertiseAreas.length > 3 && (
                <Badge variant="secondary" className="text-xs font-medium">
                  +{user.expertiseAreas.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        {/* Footer - Always at bottom with creation date and buttons */}
        {showActions && (
          <CardFooter className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            {/* Creation Date */}
            <div className="flex items-center justify-between w-full text-xs text-gray-600 dark:text-gray-400">
              <span>Oluşturulma</span>
              <span className="font-medium">{formatShortDate(user.createdAt)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full">
              {onView && (
                <Button
                  size="sm"
                  onClick={() => onView(user)}
                  className="flex-1 group/btn bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 shadow-none transition-colors"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Detaylar
                </Button>
              )}
              {onEdit && (
                <Button
                  size="sm"
                  onClick={() => onEdit(user)}
                  className="flex-1 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-none transition-colors"
                >
                  Düzenle
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  onClick={() => onDelete(user)}
                  className="flex-1 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/30 hover:border-orange-300 dark:hover:border-orange-700 shadow-none transition-colors"
                >
                  Sil
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    );
  }
);

UserCard.displayName = 'UserCard';
