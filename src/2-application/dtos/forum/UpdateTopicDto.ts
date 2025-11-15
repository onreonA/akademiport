import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';

export interface UpdateTopicDto {
  title?: string;
  content?: string;
  categoryId?: string;
  status?: TopicStatus;
  priority?: TopicPriority;
  isPinned?: boolean;
  isLocked?: boolean;
}

