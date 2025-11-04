'use client';

/**
 * Company Users List Component
 * Sprint 6: Company Management
 */

import React from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Avatar } from '@/presentation/components/ui/atoms/avatar';
import type { User } from '@/domain/entities/User';

interface CompanyUsersListProps {
  users: User[];
  maxUsers: number;
  onAddUser?: () => void;
  onRemoveUser?: (userId: string) => void;
  canManage?: boolean;
}

export function CompanyUsersList({
  users,
  maxUsers,
  onAddUser,
  onRemoveUser,
  canManage = false,
}: CompanyUsersListProps) {
  const canAddMore = users.length < maxUsers;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Kullanıcılar</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {users.length} / {maxUsers} Kullanıcı
          </p>
        </div>
        {canManage && canAddMore && onAddUser && (
          <Button onClick={onAddUser} size="sm" className="shadow-sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Kullanıcı Ekle
          </Button>
        )}
      </div>

      {/* Users List */}
      <div className="space-y-2">
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>Henüz kullanıcı eklenmemiş</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={user.role.includes('COMPANY_ADMIN') ? 'default' : 'secondary'}
                  className="border font-medium"
                >
                  {user.role.includes('COMPANY_ADMIN') ? 'Admin' : 'Kullanıcı'}
                </Badge>
                {canManage && onRemoveUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveUser(user.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Max Users Warning */}
      {!canAddMore && canManage && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            Maksimum kullanıcı sayısına ulaşıldı. Yeni kullanıcı eklemek için önce mevcut bir
            kullanıcıyı çıkarın.
          </p>
        </div>
      )}
    </div>
  );
}
