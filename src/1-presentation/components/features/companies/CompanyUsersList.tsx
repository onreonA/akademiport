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
          <h3 className="text-lg font-semibold">Kullanıcılar</h3>
          <p className="text-sm text-muted-foreground">
            {users.length} / {maxUsers} Kullanıcı
          </p>
        </div>
        {canManage && canAddMore && onAddUser && (
          <Button onClick={onAddUser} size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Kullanıcı Ekle
          </Button>
        )}
      </div>

      {/* Users List */}
      <div className="space-y-2">
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Henüz kullanıcı eklenmemiş</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
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
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={user.role.includes('COMPANY_ADMIN') ? 'default' : 'secondary'}>
                  {user.role.includes('COMPANY_ADMIN') ? 'Admin' : 'Kullanıcı'}
                </Badge>
                {canManage && onRemoveUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveUser(user.id)}
                    className="text-destructive hover:text-destructive"
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
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Maksimum kullanıcı sayısına ulaşıldı. Yeni kullanıcı eklemek için önce mevcut bir
            kullanıcıyı çıkarın.
          </p>
        </div>
      )}
    </div>
  );
}
