/**
 * Create Company DTO
 * Sprint 6: Company Management
 */

import { z } from 'zod';

// Zod Schema
export const CreateCompanySchema = z.object({
  programId: z.string().uuid('Program ID geçerli bir UUID olmalıdır'),
  name: z
    .string()
    .min(2, 'Firma adı en az 2 karakter olmalıdır')
    .max(100, 'Firma adı en fazla 100 karakter olabilir'),
  legalName: z
    .string()
    .min(2, 'Yasal ad en az 2 karakter olmalıdır')
    .max(200, 'Yasal ad en fazla 200 karakter olabilir')
    .nullable()
    .optional(),
  taxNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/, 'Vergi numarası 10 veya 11 haneli olmalıdır')
    .nullable()
    .optional(),
  tradeRegistryNumber: z
    .string()
    .max(50, 'Ticaret sicil numarası en fazla 50 karakter olabilir')
    .nullable()
    .optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir')
    .nullable()
    .optional(),
  email: z
    .string()
    .email('Geçerli bir e-posta adresi giriniz')
    .nullable()
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      'Geçerli bir telefon numarası giriniz'
    )
    .nullable()
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Geçerli bir web sitesi adresi giriniz')
    .nullable()
    .optional()
    .or(z.literal('')),
  address: z.string().max(500, 'Adres en fazla 500 karakter olabilir').nullable().optional(),
  city: z.string().max(100, 'Şehir en fazla 100 karakter olabilir').nullable().optional(),
  district: z.string().max(100, 'İlçe en fazla 100 karakter olabilir').nullable().optional(),
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, 'Posta kodu 5 haneli olmalıdır')
    .nullable()
    .optional(),
  country: z.string().max(100, 'Ülke en fazla 100 karakter olabilir').default('Türkiye'),
  sector: z.string().max(100, 'Sektör en fazla 100 karakter olabilir').nullable().optional(),
  subSector: z.string().max(100, 'Alt sektör en fazla 100 karakter olabilir').nullable().optional(),
  employeeCount: z
    .number()
    .int('Çalışan sayısı tam sayı olmalıdır')
    .min(0, 'Çalışan sayısı 0 veya daha büyük olmalıdır')
    .nullable()
    .optional(),
  foundationYear: z
    .number()
    .int('Kuruluş yılı tam sayı olmalıdır')
    .min(1800, 'Kuruluş yılı 1800 veya daha büyük olmalıdır')
    .max(new Date().getFullYear(), 'Kuruluş yılı gelecekte olamaz')
    .nullable()
    .optional(),
  maxUsers: z
    .number()
    .int('Maksimum kullanıcı sayısı tam sayı olmalıdır')
    .min(1, 'En az 1 kullanıcı olmalıdır')
    .max(10, 'En fazla 10 kullanıcı olabilir')
    .default(2),
});

// TypeScript Type
export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>;

// Helper: Generate slug from company name
export function generateCompanySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper: Validate and prepare DTO
export function prepareCreateCompanyDto(data: CreateCompanyDto): CreateCompanyDto {
  // Auto-generate slug if not provided
  if (!data.slug && data.name) {
    data.slug = generateCompanySlug(data.name);
  }

  // Set default country if not provided
  if (!data.country) {
    data.country = 'Türkiye';
  }

  // Set default maxUsers if not provided
  if (!data.maxUsers) {
    data.maxUsers = 2;
  }

  return data;
}
