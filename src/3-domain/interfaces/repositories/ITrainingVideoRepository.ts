import {
  TrainingVideo,
  CreateTrainingVideoDto,
  UpdateTrainingVideoDto,
} from '../../entities/TrainingVideo';

export interface ITrainingVideoRepository {
  /**
   * Video oluştur
   */
  create(data: CreateTrainingVideoDto): Promise<TrainingVideo>;

  /**
   * ID ile video getir
   */
  findById(id: string): Promise<TrainingVideo | null>;

  /**
   * Eğitime ait videoları listele (sıraya göre)
   */
  findByTrainingId(trainingId: string): Promise<TrainingVideo[]>;

  /**
   * Video güncelle
   */
  update(id: string, data: UpdateTrainingVideoDto): Promise<TrainingVideo>;

  /**
   * Video sil
   */
  delete(id: string): Promise<void>;

  /**
   * Eğitime ait tüm videoları sil
   */
  deleteByTrainingId(trainingId: string): Promise<void>;
}
