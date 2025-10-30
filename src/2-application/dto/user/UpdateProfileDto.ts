/**
 * Update Profile DTO
 *
 * Data Transfer Object for updating user profile (self-update)
 */

export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
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
}

/**
 * Validation Rules:
 * - fullName: Optional, min 2 chars, max 100 chars
 * - phone: Optional, valid phone format
 * - avatarUrl: Optional, valid URL or base64 image
 * - bio: Optional, max 500 chars
 * - expertiseAreas: Optional, array of strings, max 10 items
 * - socialLinks: Optional, object with valid URLs
 * - settings: Optional, user preferences
 *
 * Note: This DTO is for self-service profile updates
 * Note: Cannot change role, companyId, isActive (admin-only fields)
 * Note: Cannot change email (security)
 * Note: Cannot change password (use ChangePasswordDto)
 */

/**
 * Supported social media platforms
 */
export const SupportedSocialPlatforms = [
  'linkedin',
  'twitter',
  'facebook',
  'instagram',
  'github',
  'website',
] as const;

export type SocialPlatform = (typeof SupportedSocialPlatforms)[number];

/**
 * Helper function to validate social links
 */
export function validateSocialLinks(socialLinks: Record<string, string>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const [platform, url] of Object.entries(socialLinks)) {
    // Check if platform is supported
    if (!SupportedSocialPlatforms.includes(platform as SocialPlatform)) {
      errors.push(`Desteklenmeyen platform: ${platform}`);
      continue;
    }

    // Check if URL is valid
    try {
      new URL(url);
    } catch {
      errors.push(`Geçersiz URL: ${platform}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Supported languages
 */
export const SupportedLanguages = ['tr', 'en'] as const;

export type Language = (typeof SupportedLanguages)[number];

/**
 * Supported timezones (Turkey-focused)
 */
export const SupportedTimezones = [
  'Europe/Istanbul',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Dubai',
] as const;

export type Timezone = (typeof SupportedTimezones)[number];
