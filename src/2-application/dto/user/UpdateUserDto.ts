/**
 * Update User DTO
 *
 * Data Transfer Object for updating an existing user
 */

import { UserRole } from '@/domain/enums/UserRole';

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  role?: UserRole;
  companyId?: string;
  isActive?: boolean;
  bio?: string;
  expertiseAreas?: string[];
  socialLinks?: Record<string, string>;
  settings?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    language?: string;
    timezone?: string;
  };
  updatedBy?: string;
}

/**
 * Validation Rules:
 * - fullName: Optional, min 2 chars, max 100 chars
 * - phone: Optional, valid phone format
 * - avatarUrl: Optional, valid URL
 * - role: Optional, role transition rules apply
 * - companyId: Optional, company must exist
 * - isActive: Optional, boolean
 * - bio: Optional, max 500 chars
 * - expertiseAreas: Optional, array of strings
 * - socialLinks: Optional, object with social media links
 * - settings: Optional, user preferences
 * - updatedBy: Optional, user ID who updated this user
 *
 * Note: Email cannot be updated through this DTO (security)
 * Note: Password cannot be updated through this DTO (use ChangePasswordDto)
 */

