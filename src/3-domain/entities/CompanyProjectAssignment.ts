/**
 * CompanyProjectAssignment Entity
 * Firmaların projelere ve alt projelere atanmasını temsil eder.
 */

export interface CompanyProjectAssignment {
  id: string;
  companyId: string;
  projectId: string;
  subProjectId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyProjectAssignmentDto {
  companyId: string;
  projectId: string;
  subProjectId?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive?: boolean;
}

export interface UpdateCompanyProjectAssignmentDto {
  startDate?: Date | null;
  endDate?: Date | null;
  isActive?: boolean;
}

export class CompanyProjectAssignmentEntity implements CompanyProjectAssignment {
  id: string;
  companyId: string;
  projectId: string;
  subProjectId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: CompanyProjectAssignment) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.projectId = data.projectId;
    this.subProjectId = data.subProjectId;
    this.startDate = data.startDate ?? null;
    this.endDate = data.endDate ?? null;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /** Atama aktif mi? */
  isEnabled(): boolean {
    return this.isActive;
  }

  /** Firma projeye atanmış mı (alt proje olmadan)? */
  isProjectLevel(): boolean {
    return this.subProjectId === null;
  }

  /** Alt proje seviyesinde mi? */
  isSubProjectLevel(): boolean {
    return this.subProjectId !== null;
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

  static validate(data: CreateCompanyProjectAssignmentDto): string[] {
    const errors: string[] = [];

    if (!data.companyId || data.companyId.trim().length === 0) {
      errors.push('Company ID is required');
    }

    if (!data.projectId || data.projectId.trim().length === 0) {
      errors.push('Project ID is required');
    }

    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      errors.push('Start date cannot be later than end date');
    }

    return errors;
  }
}
