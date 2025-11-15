import { TopicStatus, TopicPriority } from '../enums/ForumEnums';

export interface ForumCategory {
  id: string;
  programId: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  orderIndex: number;
  isActive: boolean;
  requireApproval: boolean;
  topicCount: number;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
}

export interface ForumTopic {
  id: string;
  categoryId: string;
  programId: string;
  authorId: string;
  companyId: string | null;
  title: string;
  slug: string;
  content: string;
  status: TopicStatus;
  priority: TopicPriority;
  isPinned: boolean;
  isLocked: boolean;
  isApproved: boolean;
  solutionReplyId: string | null;
  solvedAt: Date | null;
  solvedBy: string | null;
  viewCount: number;
  replyCount: number;
  likeCount: number;
  lastReplyAt: Date | null;
  lastReplyBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumReply {
  id: string;
  topicId: string;
  authorId: string;
  companyId: string | null;
  parentId: string | null;
  content: string;
  isApproved: boolean;
  isEdited: boolean;
  isSolution: boolean;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumLike {
  id: string;
  topicId: string | null;
  replyId: string | null;
  userId: string;
  createdAt: Date;
}

export interface ForumNotification {
  id: string;
  userId: string;
  topicId: string | null;
  replyId: string | null;
  type: string;
  title: string;
  message: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export interface ForumActivity {
  id: string;
  userId: string;
  companyId: string;
  programId: string;
  activityType: string;
  topicId: string | null;
  replyId: string | null;
  points: number;
  createdAt: Date;
}

/**
 * Forum Topic Entity with Business Logic
 */
export class ForumTopicEntity implements ForumTopic {
  id!: string;
  categoryId!: string;
  programId!: string;
  authorId!: string;
  companyId!: string | null;
  title!: string;
  slug!: string;
  content!: string;
  status!: TopicStatus;
  priority!: TopicPriority;
  isPinned!: boolean;
  isLocked!: boolean;
  isApproved!: boolean;
  solutionReplyId!: string | null;
  solvedAt!: Date | null;
  solvedBy!: string | null;
  viewCount!: number;
  replyCount!: number;
  likeCount!: number;
  lastReplyAt!: Date | null;
  lastReplyBy!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: ForumTopic) {
    Object.assign(this, data);
  }

  /**
   * Konu açık mı?
   */
  isOpen(): boolean {
    return this.status === TopicStatus.OPEN && !this.isLocked;
  }

  /**
   * Konu çözüldü mü?
   */
  isSolved(): boolean {
    return this.status === TopicStatus.SOLVED && !!this.solutionReplyId;
  }

  /**
   * Konuyu kapat
   */
  close(): void {
    this.status = TopicStatus.CLOSED;
    this.touch();
  }

  /**
   * Konuyu aç
   */
  open(): void {
    this.status = TopicStatus.OPEN;
    this.touch();
  }

  /**
   * Konuyu kilitle
   */
  lock(): void {
    this.isLocked = true;
    this.touch();
  }

  /**
   * Kilit aç
   */
  unlock(): void {
    this.isLocked = false;
    this.touch();
  }

  /**
   * Sabitle
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
   * Çözümü işaretle
   */
  markSolution(replyId: string, userId: string): void {
    this.solutionReplyId = replyId;
    this.solvedAt = new Date();
    this.solvedBy = userId;
    this.status = TopicStatus.SOLVED;
    this.touch();
  }

  /**
   * Çözüm işaretini kaldır
   */
  unmarkSolution(): void {
    this.solutionReplyId = null;
    this.solvedAt = null;
    this.solvedBy = null;
    this.status = TopicStatus.OPEN;
    this.touch();
  }

  /**
   * Yanıt yazılabilir mi?
   */
  canReply(): boolean {
    return this.isOpen() && this.isApproved;
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
  static validate(data: Partial<ForumTopic>): string[] {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Konu başlığı gereklidir');
    }

    if (data.title && data.title.length > 500) {
      errors.push('Konu başlığı 500 karakterden uzun olamaz');
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Konu içeriği gereklidir');
    }

    if (!data.categoryId) {
      errors.push('Kategori gereklidir');
    }

    if (!data.programId) {
      errors.push('Program ID gereklidir');
    }

    if (!data.authorId) {
      errors.push('Yazar ID gereklidir');
    }

    return errors;
  }
}
