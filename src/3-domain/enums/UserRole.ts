/**
 * User Role Enum
 *
 * Kullanıcı rolleri
 */

export enum UserRole {
  MASTER_ADMIN = 'master_admin',
  PROGRAM_MANAGER = 'program_manager',
  CONSULTANT = 'consultant',
  COMPANY_ADMIN = 'company_admin',
  COMPANY_USER = 'company_user',
  OBSERVER = 'observer',
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.MASTER_ADMIN]: 'Master Admin',
  [UserRole.PROGRAM_MANAGER]: 'Program Yöneticisi',
  [UserRole.CONSULTANT]: 'Danışman',
  [UserRole.COMPANY_ADMIN]: 'Firma Yöneticisi',
  [UserRole.COMPANY_USER]: 'Firma Kullanıcısı',
  [UserRole.OBSERVER]: 'Gözlemci',
};
