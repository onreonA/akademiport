import { z } from 'zod';

/**
 * Temel veri doğrulama şemaları
 * 
 * Bu modül, API endpoint'lerinde kullanılan veri doğrulama şemalarını içerir.
 * Zod kütüphanesi kullanılarak tip güvenliği ve veri doğrulama sağlanır.
 */

// UUID doğrulama şeması
export const uuidSchema = z.string().uuid({
  message: 'Geçerli bir UUID değeri girilmelidir',
});

// E-posta doğrulama şeması
export const emailSchema = z.string().email({
  message: 'Geçerli bir e-posta adresi girilmelidir',
});

// Telefon numarası doğrulama şeması
export const phoneSchema = z
  .string()
  .regex(/^(\+90|0)?[0-9]{10}$/, {
    message: 'Geçerli bir telefon numarası girilmelidir (örn: 05551234567)',
  })
  .optional();

// Tarih doğrulama şeması
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Geçerli bir tarih girilmelidir (YYYY-MM-DD)',
  })
  .or(z.date())
  .optional();

// URL doğrulama şeması
export const urlSchema = z
  .string()
  .url({
    message: 'Geçerli bir URL girilmelidir',
  })
  .optional();

// Kullanıcı şeması
export const userSchema = z.object({
  email: emailSchema,
  full_name: z.string().min(2, {
    message: 'İsim en az 2 karakter olmalıdır',
  }),
  role: z.string(),
  company_id: z.string().uuid().optional(),
  avatar_url: urlSchema,
});

// Firma şeması
export const companySchema = z.object({
  name: z.string().min(2, {
    message: 'Firma adı en az 2 karakter olmalıdır',
  }),
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().optional(),
  city: z.string().optional(),
  industry: z.string().optional(),
  website: urlSchema,
  logo_url: urlSchema,
});

// Proje şeması
export const projectSchema = z.object({
  name: z.string().min(3, {
    message: 'Proje adı en az 3 karakter olmalıdır',
  }),
  description: z.string().min(10, {
    message: 'Proje açıklaması en az 10 karakter olmalıdır',
  }),
  status: z.enum(['Planlandı', 'Aktif', 'Tamamlandı', 'İptal Edildi']),
  start_date: dateSchema,
  end_date: dateSchema,
  admin_note: z.string().optional(),
  company_id: uuidSchema.optional(),
  consultant_id: uuidSchema.optional(),
});

// Alt proje şeması
export const subProjectSchema = z.object({
  name: z.string().min(3, {
    message: 'Alt proje adı en az 3 karakter olmalıdır',
  }),
  description: z.string().min(10, {
    message: 'Alt proje açıklaması en az 10 karakter olmalıdır',
  }),
  status: z.enum(['Planlandı', 'Aktif', 'Tamamlandı', 'İptal Edildi']),
  start_date: dateSchema,
  end_date: dateSchema,
  project_id: uuidSchema,
});

// Görev şeması
export const taskSchema = z.object({
  title: z.string().min(3, {
    message: 'Görev başlığı en az 3 karakter olmalıdır',
  }),
  description: z.string().min(10, {
    message: 'Görev açıklaması en az 10 karakter olmalıdır',
  }),
  status: z.enum(['Bekliyor', 'Aktif', 'Tamamlandı', 'İptal Edildi']),
  priority: z.enum(['Düşük', 'Normal', 'Yüksek', 'Kritik']),
  due_date: dateSchema,
  start_date: dateSchema,
  sub_project_id: uuidSchema,
  project_id: uuidSchema.optional(),
  assigned_to: uuidSchema.optional(),
});

// Görev tamamlama şeması
export const taskCompletionSchema = z.object({
  task_id: uuidSchema,
  completion_note: z.string().min(10, {
    message: 'Tamamlama notu en az 10 karakter olmalıdır',
  }),
  actual_hours: z.number().min(0).optional(),
  files: z
    .array(
      z.object({
        name: z.string(),
        url: urlSchema,
        size: z.number().optional(),
        type: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
});

// Eğitim seti şeması
export const educationSetSchema = z.object({
  title: z.string().min(3, {
    message: 'Eğitim seti başlığı en az 3 karakter olmalıdır',
  }),
  description: z.string().min(10, {
    message: 'Eğitim seti açıklaması en az 10 karakter olmalıdır',
  }),
  category: z.string().optional(),
  thumbnail_url: urlSchema,
  status: z.enum(['draft', 'published', 'archived']),
});

// Video şeması
export const videoSchema = z.object({
  title: z.string().min(3, {
    message: 'Video başlığı en az 3 karakter olmalıdır',
  }),
  description: z.string().min(10, {
    message: 'Video açıklaması en az 10 karakter olmalıdır',
  }),
  url: z.string().url({
    message: 'Geçerli bir video URL\'si girilmelidir',
  }),
  thumbnail_url: urlSchema,
  duration: z.number().min(0).optional(),
  set_id: uuidSchema,
  order: z.number().min(0).optional(),
});

// Döküman şeması
export const documentSchema = z.object({
  title: z.string().min(3, {
    message: 'Döküman başlığı en az 3 karakter olmalıdır',
  }),
  description: z.string().min(10, {
    message: 'Döküman açıklaması en az 10 karakter olmalıdır',
  }),
  category_id: uuidSchema,
  file_url: z.string().url({
    message: 'Geçerli bir dosya URL\'si girilmelidir',
  }),
  file_size: z.number().min(0).optional(),
  file_type: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
});

// Haber şeması
export const newsSchema = z.object({
  title: z.string().min(3, {
    message: 'Haber başlığı en az 3 karakter olmalıdır',
  }),
  content: z.string().min(50, {
    message: 'Haber içeriği en az 50 karakter olmalıdır',
  }),
  category_id: uuidSchema,
  expert_id: uuidSchema.optional(),
  image_url: urlSchema,
  status: z.enum(['draft', 'published', 'archived']),
  publish_date: dateSchema,
});

// Forum kategori şeması
export const forumCategorySchema = z.object({
  name: z.string().min(3, {
    message: 'Kategori adı en az 3 karakter olmalıdır',
  }),
  description: z.string().min(10, {
    message: 'Kategori açıklaması en az 10 karakter olmalıdır',
  }),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().min(0).optional(),
  is_active: z.boolean().optional(),
});

// Forum konu şeması
export const forumTopicSchema = z.object({
  title: z.string().min(3, {
    message: 'Konu başlığı en az 3 karakter olmalıdır',
  }),
  content: z.string().min(20, {
    message: 'Konu içeriği en az 20 karakter olmalıdır',
  }),
  category_id: uuidSchema,
  author_id: uuidSchema,
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  is_sticky: z.boolean().optional(),
  is_closed: z.boolean().optional(),
});

// Forum yanıt şeması
export const forumReplySchema = z.object({
  content: z.string().min(10, {
    message: 'Yanıt içeriği en az 10 karakter olmalıdır',
  }),
  topic_id: uuidSchema,
  author_id: uuidSchema,
  parent_reply_id: uuidSchema.optional(),
  is_solution: z.boolean().optional(),
});

// Randevu şeması
export const appointmentSchema = z.object({
  title: z.string().min(3, {
    message: 'Randevu başlığı en az 3 karakter olmalıdır',
  }),
  description: z.string().min(10, {
    message: 'Randevu açıklaması en az 10 karakter olmalıdır',
  }),
  start_time: z.string().or(z.date()),
  end_time: z.string().or(z.date()),
  company_id: uuidSchema,
  consultant_id: uuidSchema,
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  meeting_url: urlSchema,
  meeting_platform: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * API endpoint'leri için veri doğrulama fonksiyonu
 * @param schema - Zod şeması
 * @param data - Doğrulanacak veri
 * @returns Doğrulama sonucu (başarılı/başarısız)
 */
export function validateData<T>(schema: z.ZodType<T>, data: unknown) {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      const formattedErrors = result.error.format();
      return {
        success: false,
        errors: formattedErrors,
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: { _errors: ['Doğrulama sırasında bir hata oluştu'] },
    };
  }
}
