import { Result } from '@/6-core/result/Result';
import {
  ForumCategory,
  ForumTopic,
  ForumReply,
  ForumLike,
  ForumNotification,
  ForumActivity,
} from '../../entities/Forum';
import { TopicStatus, TopicPriority } from '../../enums/ForumEnums';

export interface ForumTopicFilters {
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
  limit?: number;
  offset?: number;
}

export interface ForumReplyFilters {
  topicId: string;
  parentId?: string | null;
  authorId?: string;
  isApproved?: boolean;
  limit?: number;
  offset?: number;
}

export interface ForumTopicWithDetails extends ForumTopic {
  category?: ForumCategory;
  authorName?: string;
  authorEmail?: string;
  companyName?: string;
  solutionReply?: ForumReply;
}

export interface ForumReplyWithDetails extends ForumReply {
  authorName?: string;
  authorEmail?: string;
  companyName?: string;
  replies?: ForumReplyWithDetails[]; // Nested replies
}

export interface IForumRepository {
  // Categories
  createCategory(
    category: Omit<ForumCategory, 'id' | 'createdAt' | 'updatedAt' | 'topicCount' | 'replyCount'>
  ): Promise<Result<ForumCategory>>;
  findCategoryById(id: string): Promise<Result<ForumCategory | null>>;
  findCategoryBySlug(programId: string, slug: string): Promise<Result<ForumCategory | null>>;
  findAllCategories(programId: string): Promise<Result<ForumCategory[]>>;
  updateCategory(id: string, category: Partial<ForumCategory>): Promise<Result<ForumCategory>>;
  deleteCategory(id: string): Promise<Result<void>>;

  // Topics
  createTopic(
    topic: Omit<
      ForumTopic,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'viewCount'
      | 'replyCount'
      | 'likeCount'
      | 'lastReplyAt'
      | 'lastReplyBy'
    >
  ): Promise<Result<ForumTopic>>;
  findTopicById(id: string): Promise<Result<ForumTopic | null>>;
  findTopicBySlug(programId: string, slug: string): Promise<Result<ForumTopic | null>>;
  findAllTopics(
    filters: ForumTopicFilters
  ): Promise<Result<{ topics: ForumTopicWithDetails[]; total: number }>>;
  updateTopic(id: string, topic: Partial<ForumTopic>): Promise<Result<ForumTopic>>;
  deleteTopic(id: string): Promise<Result<void>>;

  // Topic operations
  pinTopic(id: string): Promise<Result<ForumTopic>>;
  unpinTopic(id: string): Promise<Result<ForumTopic>>;
  lockTopic(id: string): Promise<Result<ForumTopic>>;
  unlockTopic(id: string): Promise<Result<ForumTopic>>;
  closeTopic(id: string): Promise<Result<ForumTopic>>;
  openTopic(id: string): Promise<Result<ForumTopic>>;
  approveTopic(id: string): Promise<Result<ForumTopic>>;
  rejectTopic(id: string): Promise<Result<ForumTopic>>;
  markSolution(topicId: string, replyId: string, userId: string): Promise<Result<ForumTopic>>;
  unmarkSolution(topicId: string): Promise<Result<ForumTopic>>;
  incrementViewCount(id: string): Promise<Result<void>>;

  // Replies
  createReply(
    reply: Omit<ForumReply, 'id' | 'createdAt' | 'updatedAt' | 'likeCount' | 'isEdited'>
  ): Promise<Result<ForumReply>>;
  findReplyById(id: string): Promise<Result<ForumReply | null>>;
  findAllReplies(
    filters: ForumReplyFilters
  ): Promise<Result<{ replies: ForumReplyWithDetails[]; total: number }>>;
  updateReply(id: string, reply: Partial<ForumReply>): Promise<Result<ForumReply>>;
  deleteReply(id: string): Promise<Result<void>>;
  approveReply(id: string): Promise<Result<ForumReply>>;
  rejectReply(id: string): Promise<Result<ForumReply>>;

  // Likes
  likeTopic(topicId: string, userId: string): Promise<Result<ForumLike>>;
  unlikeTopic(topicId: string, userId: string): Promise<Result<void>>;
  likeReply(replyId: string, userId: string): Promise<Result<ForumLike>>;
  unlikeReply(replyId: string, userId: string): Promise<Result<void>>;
  isTopicLikedByUser(topicId: string, userId: string): Promise<Result<boolean>>;
  isReplyLikedByUser(replyId: string, userId: string): Promise<Result<boolean>>;

  // Notifications
  createNotification(
    notification: Omit<ForumNotification, 'id' | 'createdAt' | 'isRead' | 'readAt'>
  ): Promise<Result<ForumNotification>>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Result<ForumNotification[]>>;
  markNotificationAsRead(id: string): Promise<Result<ForumNotification>>;
  markAllNotificationsAsRead(userId: string): Promise<Result<void>>;
  deleteNotification(id: string): Promise<Result<void>>;

  // Activity (for leaderboard)
  getActivity(
    userId?: string,
    companyId?: string,
    programId?: string
  ): Promise<Result<ForumActivity[]>>;
  getActivityStats(
    companyId: string,
    programId?: string
  ): Promise<
    Result<{
      totalPoints: number;
      topicsCreated: number;
      repliesCreated: number;
      solutionsMarked: number;
    }>
  >;

  // Statistics
  getCategoryStatistics(categoryId: string): Promise<
    Result<{
      topicCount: number;
      replyCount: number;
      totalViews: number;
      totalLikes: number;
    }>
  >;
  getTopicStatistics(topicId: string): Promise<
    Result<{
      viewCount: number;
      replyCount: number;
      likeCount: number;
      solutionCount: number;
    }>
  >;
}
