import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';

export interface TopicFilterDto {
  programId?: string;
  categoryId?: string;
  authorId?: string;
  companyId?: string;
  status?: TopicStatus;
  priority?: TopicPriority;
  isPinned?: boolean;
  isLocked?: boolean;
  isApproved?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'lastReplyAt' | 'replyCount' | 'viewCount' | 'likeCount';
  sortOrder?: 'asc' | 'desc';
}

