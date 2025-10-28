/**
 * Assign Role DTO
 *
 * Data Transfer Object for assigning a role to a user
 */

import { UserRole } from '@/domain/enums/UserRole';

export interface AssignRoleDto {
  userId: string;
  newRole: UserRole;
  reason?: string;
  assignedBy: string;
}

/**
 * Validation Rules:
 * - userId: Required, user must exist
 * - newRole: Required, valid UserRole
 * - reason: Optional, max 500 chars
 * - assignedBy: Required, user ID who assigned the role
 *
 * Role Transition Rules:
 * - Only MASTER_ADMIN can assign any role
 * - PROGRAM_MANAGER cannot assign MASTER_ADMIN or PROGRAM_MANAGER roles
 * - Cannot assign role to self (except MASTER_ADMIN)
 * - Role changes are logged for audit trail
 */

/**
 * Role hierarchy for permission checks
 */
export const RoleHierarchy: Record<UserRole, number> = {
  [UserRole.MASTER_ADMIN]: 5,
  [UserRole.PROGRAM_MANAGER]: 4,
  [UserRole.CONSULTANT]: 3,
  [UserRole.COMPANY_ADMIN]: 2,
  [UserRole.COMPANY_USER]: 1,
  [UserRole.OBSERVER]: 0,
};

/**
 * Helper function to check if role transition is allowed
 */
export function canAssignRole(
  assignerRole: UserRole,
  currentRole: UserRole,
  newRole: UserRole
): {
  allowed: boolean;
  reason?: string;
} {
  // MASTER_ADMIN can do anything
  if (assignerRole === UserRole.MASTER_ADMIN) {
    return { allowed: true };
  }

  // PROGRAM_MANAGER can only assign roles below their level
  if (assignerRole === UserRole.PROGRAM_MANAGER) {
    const assignerLevel = RoleHierarchy[assignerRole];
    const newRoleLevel = RoleHierarchy[newRole];

    if (newRoleLevel >= assignerLevel) {
      return {
        allowed: false,
        reason: 'Program Manager bu role atama yetkisine sahip değil',
      };
    }

    return { allowed: true };
  }

  // Others cannot assign roles
  return {
    allowed: false,
    reason: 'Bu işlem için yetkiniz yok',
  };
}

/**
 * Helper function to get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [UserRole.MASTER_ADMIN]: 'Master Admin',
    [UserRole.PROGRAM_MANAGER]: 'Program Yöneticisi',
    [UserRole.CONSULTANT]: 'Danışman',
    [UserRole.COMPANY_ADMIN]: 'Firma Yöneticisi',
    [UserRole.COMPANY_USER]: 'Firma Kullanıcısı',
    [UserRole.OBSERVER]: 'Gözlemci',
  };

  return roleNames[role];
}

/**
 * Helper function to get role description
 */
export function getRoleDescription(role: UserRole): string {
  const roleDescriptions: Record<UserRole, string> = {
    [UserRole.MASTER_ADMIN]: 'Tüm sistemi yönetir, tüm yetkilere sahiptir',
    [UserRole.PROGRAM_MANAGER]: 'Programları yönetir, firma ve danışman atar',
    [UserRole.CONSULTANT]: 'Firmalara danışmanlık verir, içerik oluşturur',
    [UserRole.COMPANY_ADMIN]: 'Firma yöneticisi, firma kullanıcılarını yönetir',
    [UserRole.COMPANY_USER]: 'Firma çalışanı, sınırlı erişim',
    [UserRole.OBSERVER]: 'Sadece görüntüleme yetkisi, değişiklik yapamaz',
  };

  return roleDescriptions[role];
}

