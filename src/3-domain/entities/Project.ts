/**
 * Project Entity
 * Ana proje entity'si - Firmaya atanan projeler
 */

export type ProjectStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  companyId: string | null;
  consultantId: string | null;
  programId: string | null; // Projenin bağlı olduğu program (performans için)
  companyName?: string | null;
  consultantName?: string | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: Date | null;
  endDate: Date | null;
  progress: number; // 0-100
  isTemplate: boolean;
  templateId: string | null;
  deletedAt: Date | null; // Soft delete için
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  companyId?: string | null;
  consultantId?: string | null;
  programId?: string | null; // Projenin bağlı olduğu program
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: Date | null;
  endDate?: Date | null;
  isTemplate?: boolean;
  templateId?: string | null;
}

export interface UpdateProjectDto {
  companyId?: string | null;
  consultantId?: string | null;
  programId?: string | null; // Projenin bağlı olduğu program
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: Date | null;
  endDate?: Date | null;
  progress?: number;
}

/**
 * Project Business Logic
 */
export class ProjectEntity implements Project {
  id: string;
  companyId: string | null;
  consultantId: string | null;
  programId: string | null;
  companyName: string | null;
  consultantName: string | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: Date | null;
  endDate: Date | null;
  progress: number;
  isTemplate: boolean;
  templateId: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Project) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.consultantId = data.consultantId;
    this.programId = data.programId ?? null;
    this.companyName = data.companyName ?? null;
    this.consultantName = data.consultantName ?? null;
    this.name = data.name;
    this.description = data.description;
    this.status = data.status;
    this.priority = data.priority;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.progress = data.progress;
    this.isTemplate = data.isTemplate;
    this.templateId = data.templateId;
    this.deletedAt = data.deletedAt ?? null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Proje tamamlanmış mı?
   */
  isCompleted(): boolean {
    return this.status === 'done';
  }

  /**
   * Proje iptal edilmiş mi?
   */
  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  /**
   * Proje aktif mi?
   */
  isActive(): boolean {
    return this.status !== 'done' && this.status !== 'cancelled';
  }

  /**
   * Proje şablon mu?
   */
  isProjectTemplate(): boolean {
    return this.isTemplate;
  }

  /**
   * Proje şablondan oluşturulmuş mu?
   */
  isCreatedFromTemplate(): boolean {
    return this.templateId !== null;
  }

  /**
   * Proje süresi dolmuş mu?
   */
  isOverdue(): boolean {
    if (!this.endDate || this.isCompleted() || this.isCancelled()) {
      return false;
    }
    return new Date() > this.endDate;
  }

  /**
   * Proje başlamış mı?
   */
  hasStarted(): boolean {
    if (!this.startDate) {
      return false;
    }
    return new Date() >= this.startDate;
  }

  /**
   * Kalan gün sayısı
   */
  getDaysRemaining(): number | null {
    if (!this.endDate || this.isCompleted() || this.isCancelled()) {
      return null;
    }
    const diff = this.endDate.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
  changeStatus(status: ProjectStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  /**
   * Firmaya ata
   */
  assignToCompany(companyId: string): void {
    if (this.isTemplate) {
      throw new Error('Cannot assign a template project to a company');
    }
    this.companyId = companyId;
    this.updatedAt = new Date();
  }

  /**
   * Danışmana ata
   */
  assignToConsultant(consultantId: string): void {
    this.consultantId = consultantId;
    this.updatedAt = new Date();
  }

  /**
   * Validation
   */
  static validate(data: CreateProjectDto): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Project name is required');
    }

    if (data.name && data.name.length > 255) {
      errors.push('Project name must be less than 255 characters');
    }

    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      errors.push('Start date must be before end date');
    }

    return errors;
  }
}
