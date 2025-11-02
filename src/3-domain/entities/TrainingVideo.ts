/**
 * TrainingVideo Entity
 * Eğitim video entity'si - YouTube video linklerini tutar
 */

export interface TrainingVideo {
  id: string;
  trainingId: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  youtubeId: string | null; // Extracted from URL
  orderIndex: number;
  isLocked: boolean; // Önceki video tamamlanmadan bu video açılmaz
  durationSeconds: number | null; // Optional, can be fetched from YouTube API
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTrainingVideoDto {
  trainingId: string;
  title: string;
  description?: string | null;
  youtubeUrl: string;
  orderIndex?: number;
  isLocked?: boolean;
  durationSeconds?: number | null;
}

export interface UpdateTrainingVideoDto {
  title?: string;
  description?: string | null;
  youtubeUrl?: string;
  orderIndex?: number;
  isLocked?: boolean;
  durationSeconds?: number | null;
}
