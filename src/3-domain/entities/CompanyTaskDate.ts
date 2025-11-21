/**
 * CompanyTaskDate Entity
 * Görevlere firma bazlı tarih atamasını temsil eder.
 */

export interface CompanyTaskDate {
  id: string;
  companyId: string;
  taskId: string;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyTaskDateDto {
  companyId: string;
  taskId: string;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive?: boolean;
}

export interface UpdateCompanyTaskDateDto {
  startDate?: Date | null;
  endDate?: Date | null;
  isActive?: boolean;
}

export class CompanyTaskDateEntity implements CompanyTaskDate {
  id: string;
  companyId: string;
  taskId: string;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: CompanyTaskDate) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.taskId = data.taskId;
    this.startDate = data.startDate ?? null;
    this.endDate = data.endDate ?? null;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /** Tarih ataması aktif mi? */
  isEnabled(): boolean {
    return this.isActive;
  }

  activate(): void {
    this.isActive = true;
    this.touch();
  }

  deactivate(): void {
    this.isActive = false;
    this.touch();
  }

  updateDates(startDate: Date | null, endDate: Date | null): void {
    if (startDate && endDate && startDate > endDate) {
      throw new Error('Start date cannot be later than end date');
    }

    this.startDate = startDate ?? null;
    this.endDate = endDate ?? null;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  static validate(data: CreateCompanyTaskDateDto): string[] {
    const errors: string[] = [];

    if (!data.companyId || data.companyId.trim().length === 0) {
      errors.push('Company ID is required');
    }

    if (!data.taskId || data.taskId.trim().length === 0) {
      errors.push('Task ID is required');
    }

    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      errors.push('Start date cannot be later than end date');
    }

    return errors;
  }
}
