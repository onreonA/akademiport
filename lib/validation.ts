import { z } from 'zod';

// Common validation schemas
export const commonSchemas = {
  uuid: z.string().uuid('Geçersiz UUID formatı'),
  email: z.string().email('Geçersiz email formatı'),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Geçersiz telefon numarası'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçersiz tarih formatı (YYYY-MM-DD)'),
  dateTime: z.string().datetime('Geçersiz tarih-saat formatı'),
  positiveInt: z.number().int().positive('Pozitif tam sayı olmalı'),
  percentage: z.number().min(0).max(100, 'Yüzde 0-100 arasında olmalı'),
  status: z.enum(['active', 'inactive', 'pending', 'locked', 'revoked']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
};

// Project validation schemas
export const projectSchemas = {
  create: z.object({
    name: z
      .string()
      .min(3, 'Proje adı en az 3 karakter olmalı')
      .max(255, 'Proje adı en fazla 255 karakter olabilir'),
    description: z
      .string()
      .min(10, 'Açıklama en az 10 karakter olmalı')
      .max(2000, 'Açıklama en fazla 2000 karakter olabilir')
      .optional(),
    type: z.enum(['B2B', 'B2C']),
    status: z
      .enum(['Planlandı', 'Aktif', 'Tamamlandı', 'Durduruldu'])
      .optional(),
    startDate: commonSchemas.date.optional(),
    endDate: commonSchemas.date.optional(),
    consultantId: commonSchemas.uuid.optional(),
    adminNote: z
      .string()
      .max(1000, 'Admin notu en fazla 1000 karakter olabilir')
      .optional(),
  }),

  update: z.object({
    name: z
      .string()
      .min(3, 'Proje adı en az 3 karakter olmalı')
      .max(255, 'Proje adı en fazla 255 karakter olabilir')
      .optional(),
    description: z
      .string()
      .min(10, 'Açıklama en az 10 karakter olmalı')
      .max(2000, 'Açıklama en fazla 2000 karakter olabilir')
      .optional(),
    status: z
      .enum(['Planlandı', 'Aktif', 'Tamamlandı', 'Durduruldu'])
      .optional(),
    startDate: commonSchemas.date.optional(),
    endDate: commonSchemas.date.optional(),
    consultantId: commonSchemas.uuid.optional(),
    adminNote: z
      .string()
      .max(1000, 'Admin notu en fazla 1000 karakter olabilir')
      .optional(),
  }),

  assignment: z.object({
    companyId: commonSchemas.uuid,
    status: commonSchemas.status,
  }),

  bulkAssignment: z.object({
    assignments: z
      .array(
        z.object({
          companyId: commonSchemas.uuid,
          status: commonSchemas.status,
        })
      )
      .min(1, 'En az bir atama gerekli')
      .max(50, 'En fazla 50 atama yapılabilir'),
  }),
};

// Sub-project validation schemas
export const subProjectSchemas = {
  create: z.object({
    projectId: commonSchemas.uuid,
    name: z
      .string()
      .min(3, 'Alt proje adı en az 3 karakter olmalı')
      .max(255, 'Alt proje adı en fazla 255 karakter olabilir'),
    description: z
      .string()
      .min(10, 'Açıklama en az 10 karakter olmalı')
      .max(2000, 'Açıklama en fazla 2000 karakter olabilir')
      .optional(),
    status: z
      .enum(['Planlandı', 'Aktif', 'Tamamlandı', 'Durduruldu'])
      .optional(),
    startDate: commonSchemas.date.optional(),
    endDate: commonSchemas.date.optional(),
  }),

  update: z.object({
    name: z
      .string()
      .min(3, 'Alt proje adı en az 3 karakter olmalı')
      .max(255, 'Alt proje adı en fazla 255 karakter olabilir')
      .optional(),
    description: z
      .string()
      .min(10, 'Açıklama en az 10 karakter olmalı')
      .max(2000, 'Açıklama en fazla 2000 karakter olabilir')
      .optional(),
    status: z
      .enum(['Planlandı', 'Aktif', 'Tamamlandı', 'Durduruldu'])
      .optional(),
    startDate: commonSchemas.date.optional(),
    endDate: commonSchemas.date.optional(),
  }),

  assignment: z.object({
    companyId: commonSchemas.uuid,
    status: commonSchemas.status,
  }),

  bulkAssignment: z.object({
    assignments: z
      .array(
        z.object({
          companyId: commonSchemas.uuid,
          status: commonSchemas.status,
        })
      )
      .min(1, 'En az bir atama gerekli')
      .max(50, 'En fazla 50 atama yapılabilir'),
  }),
};

// Task validation schemas
export const taskSchemas = {
  create: z.object({
    subProjectId: commonSchemas.uuid,
    title: z
      .string()
      .min(3, 'Görev başlığı en az 3 karakter olmalı')
      .max(255, 'Görev başlığı en fazla 255 karakter olabilir'),
    description: z
      .string()
      .min(10, 'Açıklama en az 10 karakter olmalı')
      .max(2000, 'Açıklama en fazla 2000 karakter olabilir')
      .optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    status: z
      .enum(['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'])
      .optional(),
    startDate: commonSchemas.dateTime.optional(),
    endDate: commonSchemas.dateTime.optional(),
  }),

  update: z.object({
    title: z
      .string()
      .min(3, 'Görev başlığı en az 3 karakter olmalı')
      .max(255, 'Görev başlığı en fazla 255 karakter olabilir')
      .optional(),
    description: z
      .string()
      .min(10, 'Açıklama en az 10 karakter olmalı')
      .max(2000, 'Açıklama en fazla 2000 karakter olabilir')
      .optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    status: z
      .enum(['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'])
      .optional(),
    startDate: commonSchemas.dateTime.optional(),
    endDate: commonSchemas.dateTime.optional(),
  }),

  completion: z.object({
    completionNotes: z
      .string()
      .min(10, 'Tamamlama notu en az 10 karakter olmalı')
      .max(1000, 'Tamamlama notu en fazla 1000 karakter olabilir'),
    completionDate: commonSchemas.dateTime.optional(),
  }),

  approval: z.object({
    approved: z.boolean(),
    feedback: z
      .string()
      .max(1000, 'Geri bildirim en fazla 1000 karakter olabilir')
      .optional(),
    approvedAt: commonSchemas.dateTime.optional(),
  }),
};

// Company validation schemas
export const companySchemas = {
  create: z.object({
    name: z
      .string()
      .min(3, 'Firma adı en az 3 karakter olmalı')
      .max(255, 'Firma adı en fazla 255 karakter olabilir'),
    email: commonSchemas.email,
    phone: commonSchemas.phone.optional(),
    address: z
      .string()
      .max(500, 'Adres en fazla 500 karakter olabilir')
      .optional(),
    city: z
      .string()
      .max(100, 'Şehir en fazla 100 karakter olabilir')
      .optional(),
    industry: z
      .string()
      .max(100, 'Sektör en fazla 100 karakter olabilir')
      .optional(),
    description: z
      .string()
      .max(2000, 'Açıklama en fazla 2000 karakter olabilir')
      .optional(),
    website: z.string().url('Geçersiz website URL').optional(),
  }),

  update: z.object({
    name: z
      .string()
      .min(3, 'Firma adı en az 3 karakter olmalı')
      .max(255, 'Firma adı en fazla 255 karakter olabilir')
      .optional(),
    email: commonSchemas.email.optional(),
    phone: commonSchemas.phone.optional(),
    address: z
      .string()
      .max(500, 'Adres en fazla 500 karakter olabilir')
      .optional(),
    city: z
      .string()
      .max(100, 'Şehir en fazla 100 karakter olabilir')
      .optional(),
    industry: z
      .string()
      .max(100, 'Sektör en fazla 100 karakter olabilir')
      .optional(),
    description: z
      .string()
      .max(2000, 'Açıklama en fazla 2000 karakter olabilir')
      .optional(),
    website: z.string().url('Geçersiz website URL').optional(),
    status: commonSchemas.status.optional(),
  }),
};

// Date management validation schemas
export const dateSchemas = {
  projectDate: z
    .object({
      projectId: commonSchemas.uuid,
      companyId: commonSchemas.uuid,
      startDate: commonSchemas.date,
      endDate: commonSchemas.date,
      isFlexible: z.boolean().optional(),
    })
    .refine(data => new Date(data.startDate) <= new Date(data.endDate), {
      message: 'Başlangıç tarihi bitiş tarihinden önce olmalı',
      path: ['endDate'],
    }),

  subProjectDate: z
    .object({
      subProjectId: commonSchemas.uuid,
      companyId: commonSchemas.uuid,
      startDate: commonSchemas.date,
      endDate: commonSchemas.date,
      isFlexible: z.boolean().optional(),
    })
    .refine(data => new Date(data.startDate) <= new Date(data.endDate), {
      message: 'Başlangıç tarihi bitiş tarihinden önce olmalı',
      path: ['endDate'],
    }),

  taskDate: z
    .object({
      taskId: commonSchemas.uuid,
      companyId: commonSchemas.uuid,
      startDate: commonSchemas.date.optional(),
      endDate: commonSchemas.date,
      isFlexible: z.boolean().optional(),
    })
    .refine(
      data => {
        if (data.startDate) {
          return new Date(data.startDate) <= new Date(data.endDate);
        }
        return true;
      },
      {
        message: 'Başlangıç tarihi bitiş tarihinden önce olmalı',
        path: ['endDate'],
      }
    ),

  bulkDate: z.object({
    items: z
      .array(
        z.object({
          id: commonSchemas.uuid,
          type: z.enum(['project', 'sub-project', 'task']),
          companyId: commonSchemas.uuid,
          startDate: commonSchemas.date.optional(),
          endDate: commonSchemas.date,
          isFlexible: z.boolean().optional(),
        })
      )
      .min(1, 'En az bir öğe gerekli')
      .max(100, 'En fazla 100 öğe işlenebilir'),
  }),
};

// Report validation schemas
export const reportSchemas = {
  subProjectCompletion: z.object({
    subProjectId: commonSchemas.uuid,
    companyId: commonSchemas.uuid,
    overallRating: z.number().min(1).max(5, 'Genel puan 1-5 arasında olmalı'),
    qualityScore: z.number().min(1).max(5, 'Kalite puanı 1-5 arasında olmalı'),
    timelinessScore: z
      .number()
      .min(1)
      .max(5, 'Zamanlama puanı 1-5 arasında olmalı'),
    communicationScore: z
      .number()
      .min(1)
      .max(5, 'İletişim puanı 1-5 arasında olmalı'),
    strengths: z
      .string()
      .max(1000, 'Güçlü yanlar en fazla 1000 karakter olabilir')
      .optional(),
    areasForImprovement: z
      .string()
      .max(1000, 'Gelişim alanları en fazla 1000 karakter olabilir')
      .optional(),
    recommendations: z
      .string()
      .max(1000, 'Öneriler en fazla 1000 karakter olabilir')
      .optional(),
    generalFeedback: z
      .string()
      .max(2000, 'Genel geri bildirim en fazla 2000 karakter olabilir')
      .optional(),
  }),
};

// Query parameter validation schemas
export const querySchemas = {
  pagination: z.object({
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().min(1))
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().min(1).max(100))
      .optional(),
    offset: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().min(0))
      .optional(),
  }),

  filters: z.object({
    status: commonSchemas.status.optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    startDate: commonSchemas.date.optional(),
    endDate: commonSchemas.date.optional(),
    companyId: commonSchemas.uuid.optional(),
    projectId: commonSchemas.uuid.optional(),
    subProjectId: commonSchemas.uuid.optional(),
  }),

  search: z.object({
    q: z
      .string()
      .min(1, 'Arama terimi en az 1 karakter olmalı')
      .max(100, 'Arama terimi en fazla 100 karakter olabilir')
      .optional(),
  }),
};

// Validation helper functions
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
):
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: string[];
    } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(
          err => `${err.path.join('.')}: ${err.message}`
        ),
      };
    }
    return {
      success: false,
      errors: ['Bilinmeyen doğrulama hatası'],
    };
  }
}

export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
):
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: string[];
    } {
  const params = Object.fromEntries(searchParams.entries());
  return validateRequest(schema, params);
}

// Type exports for TypeScript
export type ProjectCreateInput = z.infer<typeof projectSchemas.create>;
export type ProjectUpdateInput = z.infer<typeof projectSchemas.update>;
export type ProjectAssignmentInput = z.infer<typeof projectSchemas.assignment>;
export type SubProjectCreateInput = z.infer<typeof subProjectSchemas.create>;
export type SubProjectUpdateInput = z.infer<typeof subProjectSchemas.update>;
export type TaskCreateInput = z.infer<typeof taskSchemas.create>;
export type TaskUpdateInput = z.infer<typeof taskSchemas.update>;
export type TaskCompletionInput = z.infer<typeof taskSchemas.completion>;
export type TaskApprovalInput = z.infer<typeof taskSchemas.approval>;
export type CompanyCreateInput = z.infer<typeof companySchemas.create>;
export type CompanyUpdateInput = z.infer<typeof companySchemas.update>;
export type ProjectDateInput = z.infer<typeof dateSchemas.projectDate>;
export type SubProjectDateInput = z.infer<typeof dateSchemas.subProjectDate>;
export type TaskDateInput = z.infer<typeof dateSchemas.taskDate>;
export type BulkDateInput = z.infer<typeof dateSchemas.bulkDate>;
export type SubProjectCompletionReportInput = z.infer<
  typeof reportSchemas.subProjectCompletion
>;
export type PaginationQuery = z.infer<typeof querySchemas.pagination>;
export type FilterQuery = z.infer<typeof querySchemas.filters>;
export type SearchQuery = z.infer<typeof querySchemas.search>;
