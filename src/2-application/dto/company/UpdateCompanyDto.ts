/**
 * Update Company DTO
 * Sprint 6: Company Management
 */

import { z } from 'zod';

// Zod Schema (all fields optional for partial updates)
export const UpdateCompanySchema = z.object({
  name: z
    .string()
    .min(2, 'Firma adı en az 2 karakter olmalıdır')
    .max(100, 'Firma adı en fazla 100 karakter olabilir')
    .optional(),
  legalName: z
    .string()
    .min(2, 'Yasal ad en az 2 karakter olmalıdır')
    .max(200, 'Yasal ad en fazla 200 karakter olabilir')
    .optional(),
  taxNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/, 'Vergi numarası 10 veya 11 haneli olmalıdır')
    .optional(),
  tradeRegistryNumber: z
    .string()
    .max(50, 'Ticaret sicil numarası en fazla 50 karakter olabilir')
    .optional(),
  email: z.string().email('Geçerli bir e-posta adresi giriniz').optional(),
  phone: z
    .string()
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      'Geçerli bir telefon numarası giriniz'
    )
    .optional(),
  website: z.string().url('Geçerli bir web sitesi adresi giriniz').optional(),
  address: z.string().max(500, 'Adres en fazla 500 karakter olabilir').optional(),
  city: z.string().max(100, 'Şehir en fazla 100 karakter olabilir').optional(),
  district: z.string().max(100, 'İlçe en fazla 100 karakter olabilir').optional(),
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, 'Posta kodu 5 haneli olmalıdır')
    .optional(),
  sector: z.string().max(100, 'Sektör en fazla 100 karakter olabilir').optional(),
  subSector: z.string().max(100, 'Alt sektör en fazla 100 karakter olabilir').optional(),
  employeeCount: z
    .number()
    .int('Çalışan sayısı tam sayı olmalıdır')
    .min(0, 'Çalışan sayısı 0 veya daha büyük olmalıdır')
    .optional(),
  foundationYear: z
    .number()
    .int('Kuruluş yılı tam sayı olmalıdır')
    .min(1800, 'Kuruluş yılı 1800 veya daha büyük olmalıdır')
    .max(new Date().getFullYear())
    .optional(),
  logoUrl: z.string().url("Geçerli bir logo URL'si giriniz").optional(),
  isActive: z.boolean().optional(),
  maxUsers: z
    .number()
    .int('Maksimum kullanıcı sayısı tam sayı olmalıdır')
    .min(1, 'En az 1 kullanıcı olmalıdır')
    .max(10, 'En fazla 10 kullanıcı olabilir')
    .optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

// TypeScript Type
export type UpdateCompanyDto = z.infer<typeof UpdateCompanySchema>;
