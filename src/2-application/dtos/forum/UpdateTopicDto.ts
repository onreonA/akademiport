import { z } from 'zod';
import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';
import { commonStringSchemas, commonEnumSchemas } from '@/5-shared/validation/common-schemas';

export const UpdateTopicDtoSchema = z.object({
  title: commonStringSchemas.title(1, 500, 'Konu başlığı').optional(),
  content: commonStringSchemas.content(1, 10000, 'Konu içeriği').optional(),
  categoryId: commonStringSchemas.uuid('Geçersiz kategori ID').optional(),
  status: commonEnumSchemas.optionalStringEnum(
    Object.values(TopicStatus) as [TopicStatus, ...TopicStatus[]],
    'Geçersiz durum'
  ),
  priority: commonEnumSchemas.optionalStringEnum(
    Object.values(TopicPriority) as [TopicPriority, ...TopicPriority[]],
    'Geçersiz öncelik'
  ),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

export type UpdateTopicDto = z.infer<typeof UpdateTopicDtoSchema>;
