/**
 * TrainingDocument Entity
 * Eğitim döküman entity'si - Supabase Storage'da saklanan dosyaları tutar
 */

export interface TrainingDocument {
  id: string;
  trainingId: string;
  title: string;
  description: string | null;
  fileUrl: string; // Supabase Storage URL
  fileName: string;
  fileSize: number | null; // Size in bytes
  fileType: string | null; // MIME type (application/pdf, etc.)
  orderIndex: number;
  isLocked: boolean; // Önceki döküman okunmadan bu döküman açılmaz
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTrainingDocumentDto {
  trainingId: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileName: string;
  fileSize?: number | null;
  fileType?: string | null;
  orderIndex?: number;
  isLocked?: boolean;
}

export interface UpdateTrainingDocumentDto {
  title?: string;
  description?: string | null;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number | null;
  fileType?: string | null;
  orderIndex?: number;
  isLocked?: boolean;
}
