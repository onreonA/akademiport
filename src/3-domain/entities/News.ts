import { NewsCategory, NewsStatus } from '../enums/NewsEnums';

export interface News {
  id: string;
  programId: string;
  authorId: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  category: NewsCategory;
  status: NewsStatus;
  imageUrl: string | null;
  imageAlt: string | null;
  metaDescription: string | null;
  metaKeywords: string[] | null;
  isFeatured: boolean;
  isPinned: boolean;
  readingTime: number | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface NewsTag {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
  createdAt: Date;
}

export interface NewsComment {
  id: string;
  newsId: string;
  userId: string;
  companyId: string | null;
  content: string;
  parentId: string | null;
  isApproved: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsLike {
  id: string;
  newsId: string;
  userId: string;
  companyId: string | null;
  createdAt: Date;
}

export interface NewsRead {
  id: string;
  newsId: string;
  userId: string;
  companyId: string;
  readDuration: number | null;
  completed: boolean;
  scrollPercentage: number;
  createdAt: Date;
}

/**
 * News Entity with Business Logic
 */
export class NewsEntity implements News {
  id: string;
  programId: string;
  authorId: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  category: NewsCategory;
  status: NewsStatus;
  imageUrl: string | null;
  imageAlt: string | null;
  metaDescription: string | null;
  metaKeywords: string[] | null;
  isFeatured: boolean;
  isPinned: boolean;
  readingTime: number | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;

  constructor(data: News) {
    this.id = data.id;
    this.programId = data.programId;
    this.authorId = data.authorId;
    this.title = data.title;
    this.slug = data.slug;
    this.summary = data.summary;
    this.content = data.content;
    this.category = data.category;
    this.status = data.status;
    this.imageUrl = data.imageUrl;
    this.imageAlt = data.imageAlt;
    this.metaDescription = data.metaDescription;
    this.metaKeywords = data.metaKeywords;
    this.isFeatured = data.isFeatured;
    this.isPinned = data.isPinned;
    this.readingTime = data.readingTime;
    this.viewCount = data.viewCount;
    this.likeCount = data.likeCount;
    this.commentCount = data.commentCount;
    this.publishedAt = data.publishedAt;
    this.archivedAt = data.archivedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
  }

  /**
   * Haber yayında mı?
   */
  isPublished(): boolean {
    return this.status === NewsStatus.PUBLISHED && !!this.publishedAt;
  }

  /**
   * Haber taslak mı?
   */
  isDraft(): boolean {
    return this.status === NewsStatus.DRAFT;
  }

  /**
   * Haber arşivlenmiş mi?
   */
  isArchived(): boolean {
    return this.status === NewsStatus.ARCHIVED;
  }

  /**
   * Haberi yayınla
   */
  publish(): void {
    if (this.status === NewsStatus.PUBLISHED) {
      throw new Error('Haber zaten yayında');
    }
    this.status = NewsStatus.PUBLISHED;
    this.publishedAt = new Date();
    this.touch();
  }

  /**
   * Haberi arşivle
   */
  archive(): void {
    this.status = NewsStatus.ARCHIVED;
    this.archivedAt = new Date();
    this.touch();
  }

  /**
   * Haberi taslağa çevir
   */
  unpublish(): void {
    this.status = NewsStatus.DRAFT;
    this.publishedAt = null;
    this.touch();
  }

  /**
   * Öne çıkan haber yap
   */
  feature(): void {
    this.isFeatured = true;
    this.touch();
  }

  /**
   * Öne çıkarmayı kaldır
   */
  unfeature(): void {
    this.isFeatured = false;
    this.touch();
  }

  /**
   * Haberi sabitle
   */
  pin(): void {
    this.isPinned = true;
    this.touch();
  }

  /**
   * Sabitlemeyi kaldır
   */
  unpin(): void {
    this.isPinned = false;
    this.touch();
  }

  /**
   * Okuma süresini hesapla (kelime sayısına göre)
   */
  calculateReadingTime(): void {
    const wordsPerMinute = 200;
    const text = this.content.replace(/<[^>]*>/g, ''); // HTML tag'lerini temizle
    const wordCount = text.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
    this.touch();
  }

  /**
   * updatedAt'i güncelle
   */
  private touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Validation
   */
  static validate(data: Partial<News>): string[] {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Haber başlığı gereklidir');
    }

    if (data.title && data.title.length > 500) {
      errors.push('Haber başlığı 500 karakterden uzun olamaz');
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Haber içeriği gereklidir');
    }

    if (!data.programId) {
      errors.push('Program ID gereklidir');
    }

    if (!data.authorId) {
      errors.push('Yazar ID gereklidir');
    }

    if (!data.category) {
      errors.push('Kategori gereklidir');
    }

    if (data.summary && data.summary.length > 500) {
      errors.push('Özet 500 karakterden uzun olamaz');
    }

    if (data.metaDescription && data.metaDescription.length > 160) {
      errors.push('Meta açıklama 160 karakterden uzun olamaz');
    }

    return errors;
  }
}
