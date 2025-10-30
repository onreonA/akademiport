/**
 * Change Password DTO
 *
 * Data Transfer Object for changing user password
 */

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Validation Rules:
 * - oldPassword: Required
 * - newPassword: Required, min 8 chars, must contain uppercase, lowercase, number
 * - confirmPassword: Required, must match newPassword
 * - newPassword must be different from oldPassword
 *
 * Password Strength Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - Optional: At least one special character
 */

/**
 * Helper function to validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Helper function to calculate password strength score
 */
export function calculatePasswordStrength(password: string): {
  score: number; // 0-4
  label: 'Çok Zayıf' | 'Zayıf' | 'Orta' | 'Güçlü' | 'Çok Güçlü';
} {
  let score = 0;

  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character types
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const labels: Array<'Çok Zayıf' | 'Zayıf' | 'Orta' | 'Güçlü' | 'Çok Güçlü'> = [
    'Çok Zayıf',
    'Zayıf',
    'Orta',
    'Güçlü',
    'Çok Güçlü',
  ];

  return {
    score,
    label: labels[score],
  };
}
