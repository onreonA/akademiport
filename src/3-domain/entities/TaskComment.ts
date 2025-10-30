/**
 * TaskComment Entity
 * Görev yorumu entity'si - Görev altında soru/cevap sistemi
 */

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  isQuestion: boolean;
  createdAt: Date;
}

export interface CreateTaskCommentDto {
  taskId: string;
  userId: string;
  comment: string;
  isQuestion?: boolean;
}

/**
 * TaskComment Business Logic
 */
export class TaskCommentEntity implements TaskComment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  isQuestion: boolean;
  createdAt: Date;

  constructor(data: TaskComment) {
    this.id = data.id;
    this.taskId = data.taskId;
    this.userId = data.userId;
    this.comment = data.comment;
    this.isQuestion = data.isQuestion;
    this.createdAt = data.createdAt;
  }

  /**
   * Yorum bir soru mu?
   */
  isQuestionComment(): boolean {
    return this.isQuestion;
  }

  /**
   * Validation
   */
  static validate(data: CreateTaskCommentDto): string[] {
    const errors: string[] = [];

    if (!data.taskId || data.taskId.trim().length === 0) {
      errors.push('Task ID is required');
    }

    if (!data.userId || data.userId.trim().length === 0) {
      errors.push('User ID is required');
    }

    if (!data.comment || data.comment.trim().length === 0) {
      errors.push('Comment is required');
    }

    if (data.comment && data.comment.length > 2000) {
      errors.push('Comment must be less than 2000 characters');
    }

    return errors;
  }
}
