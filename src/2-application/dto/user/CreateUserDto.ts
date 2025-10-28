/**
 * Create User DTO
 *
 * Data Transfer Object for creating a new user
 */

import { UserRole } from '@/domain/enums/UserRole';

export interface CreateUserDto {
  email: string;
  fullName: string;
  password: string;
  phone?: string;
  role?: UserRole;
  companyId?: string;
  bio?: string;
  expertiseAreas?: string[];
  socialLinks?: Record<string, string>;
  createdBy?: string;
}

/**
 * Validation Rules:
 * - email: Required, valid email format
 * - fullName: Required, min 2 chars, max 100 chars
 * - password: Required, min 8 chars, must contain uppercase, lowercase, number
 * - phone: Optional, valid phone format
 * - role: Optional, defaults to COMPANY_USER
 * - companyId: Optional, required if role is COMPANY_ADMIN or COMPANY_USER
 * - bio: Optional, max 500 chars
 * - expertiseAreas: Optional, array of strings
 * - socialLinks: Optional, object with social media links
 * - createdBy: Optional, user ID who created this user
 */

