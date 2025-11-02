/**
 * Quick Actions FAB Component
 * Floating Action Button for quick create actions
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FolderKanban, Building2, Users, X } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { cn } from '@/presentation/lib/utils';
import { useAuth } from '@/shared/hooks/useAuth';
import { UserRole } from '@/domain/enums/UserRole';

// =====================================================
// TYPES
// =====================================================
interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  roles: UserRole[];
}

// =====================================================
// QUICK ACTIONS CONFIG
// =====================================================
const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-program',
    label: 'Yeni Program',
    icon: FolderKanban,
    href: '/dashboard/programs/new',
    roles: [UserRole.MASTER_ADMIN, UserRole.PROGRAM_MANAGER],
  },
  {
    id: 'new-company',
    label: 'Yeni Firma',
    icon: Building2,
    href: '/dashboard/companies/new',
    roles: [UserRole.MASTER_ADMIN, UserRole.PROGRAM_MANAGER],
  },
  {
    id: 'new-user',
    label: 'Yeni Kullanıcı',
    icon: Users,
    href: '/dashboard/users/new',
    roles: [UserRole.MASTER_ADMIN, UserRole.PROGRAM_MANAGER, UserRole.COMPANY_ADMIN],
  },
];

// =====================================================
// COMPONENT
// =====================================================
export function QuickActionsFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  // Filter actions based on user role
  const availableActions = QUICK_ACTIONS.filter((action) =>
    action.roles.includes(user.role as UserRole)
  );

  if (availableActions.length === 0) return null;

  const handleActionClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB Container */}
      <div className="fixed bottom-20 right-6 z-30 md:bottom-6">
        {/* Action Buttons */}
        <div
          className={cn(
            'mb-4 flex flex-col gap-3 transition-all duration-300',
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          )}
        >
          {availableActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className="flex items-center gap-3 animate-in slide-in-from-bottom-2"
              >
                <span className="rounded-lg bg-background px-3 py-2 text-sm font-medium shadow-lg border">
                  {action.label}
                </span>
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full shadow-lg"
                  onClick={() => handleActionClick(action.href)}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Main FAB Button */}
        <Button
          size="icon"
          className={cn(
            'h-14 w-14 rounded-full shadow-lg transition-transform',
            isOpen && 'rotate-45'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>
    </>
  );
}
