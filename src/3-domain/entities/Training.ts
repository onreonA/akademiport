/**
 * Training Entity
 * Eğitim entity'si - Global veya program bazlı eğitimler
 */

export type TrainingStatus = 'draft' | 'active' | 'archived';
export type TrainingPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Training {
  id: string;
  name: string;
  description: string | null;
  programId: string | null;
  consultantId: string | null;
  isGlobal: boolean;
  status: TrainingStatus;
  priority: TrainingPriority;
  isLocked: boolean; // Sıralı erişim kontrolü için
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
}

export interface CreateTrainingDto {
  name: string;
  description?: string | null;
  programId?: string | null;
  consultantId?: string | null;
  isGlobal?: boolean;
  status?: TrainingStatus;
  priority?: TrainingPriority;
  isLocked?: boolean;
  createdBy?: string | null;
}

export interface UpdateTrainingDto {
  name?: string;
  description?: string | null;
  programId?: string | null;
  consultantId?: string | null;
  isGlobal?: boolean;
  status?: TrainingStatus;
  priority?: TrainingPriority;
  isLocked?: boolean;
}

export interface TrainingFilterDto {
  programId?: string | null;
  consultantId?: string | null;
  isGlobal?: boolean;
  status?: TrainingStatus;
  priority?: TrainingPriority;
  search?: string;
  page?: number;
  limit?: number;
}
