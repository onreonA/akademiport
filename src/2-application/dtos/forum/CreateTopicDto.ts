import { z } from 'zod';
import { TopicPriority } from '@/3-domain/enums/ForumEnums';
import { commonStringSchemas, commonEnumSchemas } from '@/5-shared/validation/common-schemas';

export const CreateTopicDtoSchema = z.object({
  programId: commonStringSchemas.uuid('Geçersiz program ID'),
  categoryId: commonStringSchemas.uuid('Geçersiz kategori ID'),
  title: commonStringSchemas.title(1, 500, 'Konu başlığı'),
  content: commonStringSchemas.content(1, 10000, 'Konu içeriği'),
  priority: commonEnumSchemas.optionalStringEnum(
    Object.values(TopicPriority) as [TopicPriority, ...TopicPriority[]],
    'Geçersiz öncelik'
  ),
});

export type CreateTopicDto = z.infer<typeof CreateTopicDtoSchema>;
