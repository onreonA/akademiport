import {
  TrainingProgress,
  CreateTrainingProgressDto,
  UpdateTrainingProgressDto,
  TrainingProgressFilterDto,
} from '../../entities/TrainingProgress';

export interface ITrainingProgressRepository {
  /**
   * İlerleme kaydı oluştur
   */
  create(data: CreateTrainingProgressDto): Promise<TrainingProgress>;

  /**
   * ID ile ilerleme getir
   */
  findById(id: string): Promise<TrainingProgress | null>;

  /**
   * Firma-Eğitim ilerlemesini getir
   */
  findByCompanyAndTraining(companyId: string, trainingId: string): Promise<TrainingProgress[]>;

  /**
   * Video ilerlemesini getir
   */
  findByVideo(companyId: string, videoId: string): Promise<TrainingProgress | null>;

  /**
   * Döküman ilerlemesini getir
   */
  findByDocument(companyId: string, documentId: string): Promise<TrainingProgress | null>;

  /**
   * İlerlemeleri filtrele
   */
  findAll(filters?: TrainingProgressFilterDto): Promise<TrainingProgress[]>;

  /**
   * İlerleme güncelle
   */
  update(id: string, data: UpdateTrainingProgressDto): Promise<TrainingProgress>;

  /**
   * İlerleme sil
   */
  delete(id: string): Promise<void>;

  /**
   * Eğitime ait tüm ilerlemeleri sil
   */
  deleteByTrainingId(trainingId: string): Promise<void>;
}
