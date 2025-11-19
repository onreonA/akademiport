/**
 * SubProject Entity
 * Alt proje entity'si - Projenin alt bileşenleri
 */

export type SubProjectStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';

export interface SubProject {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  status: SubProjectStatus;
  orderIndex: number;
  progress: number; // 0-100
  deletedAt: Date | null; // Soft delete için
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubProjectDto {
  projectId: string;
  name: string;
  description?: string | null;
  status?: SubProjectStatus;
  orderIndex?: number;
}

export interface UpdateSubProjectDto {
  name?: string;
  description?: string | null;
  status?: SubProjectStatus;
  orderIndex?: number;
  progress?: number;
}

/**
 * SubProject Business Logic
 */
export class SubProjectEntity implements SubProject {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  status: SubProjectStatus;
  orderIndex: number;
  progress: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: SubProject) {
    this.id = data.id;
    this.projectId = data.projectId;
    this.name = data.name;
    this.description = data.description;
    this.status = data.status;
    this.orderIndex = data.orderIndex;
    this.progress = data.progress;
    this.deletedAt = data.deletedAt ?? null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Alt proje tamamlanmış mı?
   */
  isCompleted(): boolean {
    return this.status === 'done';
  }

  /**
   * Alt proje iptal edilmiş mi?
   */
  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  /**
   * Alt proje aktif mi?
   */
  isActive(): boolean {
    return this.status !== 'done' && this.status !== 'cancelled';
  }

  /**
   * İlerleme yüzdesi güncelle
   */
  updateProgress(progress: number): void {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }
    this.progress = progress;
    this.updatedAt = new Date();

    // İlerleme 100 olduğunda durumu 'done' yap
    if (progress === 100 && this.status !== 'done') {
      this.status = 'done';
    }
  }

  /**
   * Durum değiştir
   */
  changeStatus(status: SubProjectStatus): void {
    this.status = status;
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
   * Validation
   */
  static validate(data: CreateSubProjectDto): string[] {
    const errors: string[] = [];

    if (!data.projectId || data.projectId.trim().length === 0) {
      errors.push('Project ID is required');
    }

    if (!data.name || data.name.trim().length === 0) {
      errors.push('SubProject name is required');
    }

    if (data.name && data.name.length > 255) {
      errors.push('SubProject name must be less than 255 characters');
    }

    if (data.orderIndex !== undefined && data.orderIndex < 0) {
      errors.push('Order index must be positive');
    }

    return errors;
  }
}
