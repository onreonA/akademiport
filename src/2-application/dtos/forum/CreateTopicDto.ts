import { TopicPriority } from '@/3-domain/enums/ForumEnums';

export interface CreateTopicDto {
  programId: string;
  categoryId: string;
  title: string;
  content: string;
  priority?: TopicPriority;
}
