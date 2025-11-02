/**
 * CompanyTraining Entity
 * Firma-Eğitim atama entity'si - Firmalara atanan eğitimleri tutar
 */

export type CompanyTrainingStatus = 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface CompanyTraining {
  id: string;
  companyId: string;
  trainingId: string;
  assignedBy: string; // Consultant who assigned
  assignedAt: Date;
  status: CompanyTrainingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyTrainingDto {
  companyId: string;
  trainingId: string;
  assignedBy: string;
  status?: CompanyTrainingStatus;
}

export interface AssignTrainingToCompanyDto {
  companyId: string;
  trainingId: string;
  status?: CompanyTrainingStatus;
}

export interface UpdateCompanyTrainingDto {
  status?: CompanyTrainingStatus;
}
