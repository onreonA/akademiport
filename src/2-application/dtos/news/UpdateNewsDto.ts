import { z } from 'zod';
import { NewsCategory } from '@/3-domain/enums/NewsEnums';
import { commonStringSchemas, commonEnumSchemas } from '@/5-shared/validation/common-schemas';

export const UpdateNewsDtoSchema = z.object({
  title: commonStringSchemas.title(1, 500, 'Haber başlığı').optional(),
  summary: commonStringSchemas.description(500, 'Özet').optional(),
  content: commonStringSchemas.content(1, 50000, 'Haber içeriği').optional(),
  category: commonEnumSchemas.optionalStringEnum(
    Object.values(NewsCategory) as [NewsCategory, ...NewsCategory[]],
    'Geçersiz kategori'
  ),
  imageUrl: commonStringSchemas.url('Geçersiz resim URL').optional(),
  imageAlt: commonStringSchemas.name(1, 255, 'Resim alt metni').optional(),
  metaDescription: commonStringSchemas.description(160, 'Meta açıklama').optional(),
  metaKeywords: z
    .array(commonStringSchemas.name(1, 50, 'Anahtar kelime'))
    .max(10, 'En fazla 10 anahtar kelime')
    .optional(),
  isFeatured: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  tags: z.array(commonStringSchemas.uuid('Geçersiz tag ID')).optional(),
});

export type UpdateNewsDto = z.infer<typeof UpdateNewsDtoSchema>;
