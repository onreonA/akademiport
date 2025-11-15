import { Result } from '@/6-core/result/Result';
import {
  News,
  NewsTag,
  NewsComment,
  NewsLike,
  NewsRead,
} from '../../entities/News';
import { NewsCategory, NewsStatus } from '../../enums/NewsEnums';

export interface NewsFilters {
  programId?: string;
  authorId?: string;
  category?: NewsCategory;
  status?: NewsStatus;
  isFeatured?: boolean;
  isPinned?: boolean;
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface NewsWithTags extends News {
  tags: NewsTag[];
  authorName?: string;
}

export interface INewsRepository {
  // News CRUD
  create(news: Omit<News, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<News>>;
  findById(id: string): Promise<Result<News | null>>;
  findBySlug(slug: string): Promise<Result<News | null>>;
  findAll(filters: NewsFilters): Promise<Result<NewsWithTags[]>>;
  update(id: string, news: Partial<News>): Promise<Result<News>>;
  delete(id: string): Promise<Result<void>>;
  
  // Status operations
  publish(id: string, userId: string): Promise<Result<News>>;
  archive(id: string, userId: string): Promise<Result<News>>;
  unpublish(id: string, userId: string): Promise<Result<News>>;
  
  // Feature operations
  feature(id: string): Promise<Result<News>>;
  unfeature(id: string): Promise<Result<News>>;
  pin(id: string): Promise<Result<News>>;
  unpin(id: string): Promise<Result<News>>;
  
  // Tags
  getTags(): Promise<Result<NewsTag[]>>;
  createTag(name: string, slug: string): Promise<Result<NewsTag>>;
  addTagToNews(newsId: string, tagId: string): Promise<Result<void>>;
  removeTagFromNews(newsId: string, tagId: string): Promise<Result<void>>;
  getNewsTags(newsId: string): Promise<Result<NewsTag[]>>;
  
  // Comments
  createComment(comment: Omit<NewsComment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<NewsComment>>;
  getComments(newsId: string): Promise<Result<NewsComment[]>>;
  updateComment(id: string, content: string): Promise<Result<NewsComment>>;
  deleteComment(id: string): Promise<Result<void>>;
  approveComment(id: string): Promise<Result<NewsComment>>;
  
  // Likes
  likeNews(newsId: string, userId: string, companyId: string | null): Promise<Result<NewsLike>>;
  unlikeNews(newsId: string, userId: string): Promise<Result<void>>;
  isLikedByUser(newsId: string, userId: string): Promise<Result<boolean>>;
  
  // Reads (for leaderboard)
  recordRead(read: Omit<NewsRead, 'id' | 'createdAt'>): Promise<Result<NewsRead>>;
  getUserReads(userId: string, programId?: string): Promise<Result<NewsRead[]>>;
  getNewsReads(newsId: string): Promise<Result<NewsRead[]>>;
  
  // Statistics
  getStatistics(programId?: string): Promise<Result<{
    totalNews: number;
    publishedNews: number;
    draftNews: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalReads: number;
    completedReads: number;
  }>>;
}

