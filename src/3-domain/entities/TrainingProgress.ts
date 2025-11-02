/**
 * TrainingProgress Entity
 * Eğitim izleme takibi entity'si - Firmaların eğitimlere ait ilerlemelerini tutar
 */

export interface TrainingProgress {
  id: string;
  companyId: string;
  trainingId: string;
  videoId: string | null; // Video izleme takibi için (nullable)
  documentId: string | null; // Document okuma takibi için (nullable)
  progressPercentage: number; // 0-100
  watchedAt: Date | null; // Video için izleme zamanı
  readAt: Date | null; // Document için okuma zamanı
  completedAt: Date | null; // Tamamlanma zamanı
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTrainingProgressDto {
  companyId: string;
  trainingId: string;
  videoId?: string | null;
  documentId?: string | null;
  progressPercentage?: number;
  watchedAt?: Date | null;
  readAt?: Date | null;
  completedAt?: Date | null;
}

export interface UpdateTrainingProgressDto {
  progressPercentage?: number;
  watchedAt?: Date | null;
  readAt?: Date | null;
  completedAt?: Date | null;
}

export interface TrainingProgressFilterDto {
  companyId?: string;
  trainingId?: string;
  videoId?: string | null;
  documentId?: string | null;
}
