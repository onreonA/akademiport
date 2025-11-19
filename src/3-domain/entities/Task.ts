/**
 * Task Entity
 * Görev entity'si - Alt projenin görevleri
 */

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  subProjectId: string;
  assignedTo: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  completedAt: Date | null;
  approvedAt: Date | null;
  approvedBy: string | null;
  orderIndex: number;
  deletedAt: Date | null; // Soft delete için
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  subProjectId: string;
  assignedTo?: string | null;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
  orderIndex?: number;
}

export interface UpdateTaskDto {
  assignedTo?: string | null;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
  orderIndex?: number;
}

/**
 * Task Business Logic
 */
export class TaskEntity implements Task {
  id: string;
  subProjectId: string;
  assignedTo: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  completedAt: Date | null;
  approvedAt: Date | null;
  approvedBy: string | null;
  orderIndex: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Task) {
    this.id = data.id;
    this.subProjectId = data.subProjectId;
    this.assignedTo = data.assignedTo;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status;
    this.priority = data.priority;
    this.dueDate = data.dueDate;
    this.completedAt = data.completedAt;
    this.approvedAt = data.approvedAt;
    this.approvedBy = data.approvedBy;
    this.orderIndex = data.orderIndex;
    this.deletedAt = data.deletedAt ?? null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Görev tamamlanmış mı?
   */
  isCompleted(): boolean {
    return this.status === 'done';
  }

  /**
   * Görev onaylanmış mı?
   */
  isApproved(): boolean {
    return this.approvedAt !== null;
  }

  /**
   * Görev iptal edilmiş mi?
   */
  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  /**
   * Görev aktif mi?
   */
  isActive(): boolean {
    return this.status !== 'done' && this.status !== 'cancelled';
  }

  /**
   * Görev atanmış mı?
   */
  isAssigned(): boolean {
    return this.assignedTo !== null;
  }

  /**
   * Görev süresi dolmuş mu?
   */
  isOverdue(): boolean {
    if (!this.dueDate || this.isCompleted() || this.isCancelled()) {
      return false;
    }
    return new Date() > this.dueDate;
  }

  /**
   * Görev review'de mi?
   */
  isInReview(): boolean {
    return this.status === 'review';
  }

  /**
   * Kalan gün sayısı
   */
  getDaysRemaining(): number | null {
    if (!this.dueDate || this.isCompleted() || this.isCancelled()) {
      return null;
    }
    const diff = this.dueDate.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Görevi tamamla
   */
  complete(): void {
    if (this.isCompleted()) {
      throw new Error('Task is already completed');
    }
    if (this.isCancelled()) {
      throw new Error('Cannot complete a cancelled task');
    }
    this.status = 'review';
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Görevi onayla
   */
  approve(approvedBy: string): void {
    if (!this.isInReview() && !this.isCompleted()) {
      throw new Error('Task must be in review or completed to be approved');
    }
    if (this.isApproved()) {
      throw new Error('Task is already approved');
    }
    this.status = 'done';
    this.approvedAt = new Date();
    this.approvedBy = approvedBy;
    this.updatedAt = new Date();
  }

  /**
   * Görevi reddet (review'den geri gönder)
   */
  reject(): void {
    if (!this.isInReview()) {
      throw new Error('Task must be in review to be rejected');
    }
    this.status = 'in_progress';
    this.completedAt = null;
    this.updatedAt = new Date();
  }

  /**
   * Durum değiştir
   */
  changeStatus(status: TaskStatus): void {
    this.status = status;
    this.updatedAt = new Date();

    if (status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    }
  }

  /**
   * Kullanıcıya ata
   */
  assignTo(userId: string): void {
    this.assignedTo = userId;
    this.updatedAt = new Date();
  }

  /**
   * Atamayı kaldır
   */
  unassign(): void {
    this.assignedTo = null;
    this.updatedAt = new Date();
  }

  /**
   * Sıralama değiştir
   */
  changeOrder(orderIndex: number): void {
    if (orderIndex < 0) {
      throw new Error('Order index must be positive');
    }
    this.orderIndex = orderIndex;
    this.updatedAt = new Date();
  }

  /**
   * Öncelik değiştir
   */
  changePriority(priority: TaskPriority): void {
    this.priority = priority;
    this.updatedAt = new Date();
  }

  /**
   * Validation
   */
  static validate(data: CreateTaskDto): string[] {
    const errors: string[] = [];

    if (!data.subProjectId || data.subProjectId.trim().length === 0) {
      errors.push('SubProject ID is required');
    }

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Task title is required');
    }

    if (data.title && data.title.length > 255) {
      errors.push('Task title must be less than 255 characters');
    }

    if (data.orderIndex !== undefined && data.orderIndex < 0) {
      errors.push('Order index must be positive');
    }

    return errors;
  }
}
