/**
 * Common Validation Schemas
 *
 * Güvenli ve tutarlı validation için ortak Zod schema'ları
 */

import { z } from 'zod';

/**
 * Common string validations
 */
export const commonStringSchemas = {
  // UUID validation
  uuid: (message = 'Geçersiz UUID formatı') => z.string().uuid(message).trim(),

  // Email validation
  email: (message = 'Geçersiz e-posta adresi') =>
    z.string().email(message).toLowerCase().trim().max(255, 'E-posta adresi çok uzun'),

  // URL validation
  url: (message = 'Geçersiz URL formatı') =>
    z.string().url(message).trim().max(2048, 'URL çok uzun'),

  // Slug validation (alphanumeric, hyphens, underscores)
  slug: (message = 'Geçersiz slug formatı') =>
    z
      .string()
      .trim()
      .min(1, 'Slug boş olamaz')
      .max(255, 'Slug çok uzun')
      .regex(/^[a-z0-9-_]+$/, message)
      .toLowerCase(),

  // Title validation (1-500 chars, no dangerous characters)
  title: (min = 1, max = 500, message = 'Başlık') =>
    z
      .string()
      .trim()
      .min(min, `${message} en az ${min} karakter olmalıdır`)
      .max(max, `${message} en fazla ${max} karakter olabilir`)
      .refine((val) => !/[<>]/.test(val), `${message} HTML karakterleri içeremez`),

  // Content validation (sanitized HTML allowed)
  content: (min = 1, max = 10000, message = 'İçerik') =>
    z
      .string()
      .trim()
      .min(min, `${message} en az ${min} karakter olmalıdır`)
      .max(max, `${message} en fazla ${max} karakter olabilir`),

  // Description validation
  description: (max = 1000, message = 'Açıklama') =>
    z
      .string()
      .trim()
      .max(max, `${message} en fazla ${max} karakter olabilir`)
      .optional()
      .nullable(),

  // Notes validation
  notes: (max = 500, message = 'Notlar') =>
    z
      .string()
      .trim()
      .max(max, `${message} en fazla ${max} karakter olabilir`)
      .optional()
      .nullable(),

  // Name validation (1-255 chars)
  name: (min = 1, max = 255, message = 'İsim') =>
    z
      .string()
      .trim()
      .min(min, `${message} en az ${min} karakter olmalıdır`)
      .max(max, `${message} en fazla ${max} karakter olabilir`)
      .refine((val) => !/[<>]/.test(val), `${message} HTML karakterleri içeremez`),

  // Search query validation
  searchQuery: (max = 100) =>
    z.string().trim().max(max, 'Arama sorgusu çok uzun').optional().nullable(),
};

/**
 * Common number validations
 */
export const commonNumberSchemas = {
  // Positive integer
  positiveInt: (message = 'Pozitif tam sayı olmalıdır') =>
    z.number().int(message).positive(message),

  // Non-negative integer
  nonNegativeInt: (message = 'Negatif olamaz') => z.number().int().min(0, message),

  // Pagination limit (1-100)
  paginationLimit: (max = 100) =>
    z
      .number()
      .int()
      .min(1, 'Limit en az 1 olmalıdır')
      .max(max, `Limit en fazla ${max} olabilir`)
      .default(50),

  // Pagination offset (>= 0)
  paginationOffset: () => z.number().int().min(0, 'Offset negatif olamaz').default(0),

  // Percentage (0-100)
  percentage: () =>
    z.number().min(0, "Yüzde 0'dan küçük olamaz").max(100, "Yüzde 100'den büyük olamaz"),

  // Score/Points (>= 0)
  score: () => z.number().min(0, 'Puan negatif olamaz').int('Puan tam sayı olmalıdır'),
};

/**
 * Common date validations
 */
export const commonDateSchemas = {
  // ISO date string
  isoDate: (message = 'Geçersiz tarih formatı') => z.string().datetime(message).or(z.date()),

  // Future date
  futureDate: (message = 'Gelecek bir tarih olmalıdır') =>
    z.date().refine((date) => date > new Date(), message),

  // Past date
  pastDate: (message = 'Geçmiş bir tarih olmalıdır') =>
    z.date().refine((date) => date < new Date(), message),
};

/**
 * Common enum validations
 */
export const commonEnumSchemas = {
  // String enum
  stringEnum: <T extends [string, ...string[]]>(values: T, message = 'Geçersiz değer') =>
    z.enum(values, { message }),

  // Optional string enum
  optionalStringEnum: <T extends [string, ...string[]]>(values: T, message = 'Geçersiz değer') =>
    z.enum(values, { message }).optional(),
};

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize HTML content (basic)
 * Note: For production, use a proper HTML sanitizer like DOMPurify
 */
export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, ''); // Remove javascript: protocol
}

/**
 * Custom Zod refinement for SQL injection prevention
 */
export const sqlInjectionSafe = z.string().refine(
  (val) => {
    // Common SQL injection patterns
    const dangerousPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
      /(--|#|\/\*|\*\/|;)/,
      /(\bOR\b.*=.*=)/i,
      /(\bAND\b.*=.*=)/i,
    ];

    return !dangerousPatterns.some((pattern) => pattern.test(val));
  },
  {
    message: 'Geçersiz karakterler tespit edildi',
  }
);
