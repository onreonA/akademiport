import {
  TrainingDocument,
  CreateTrainingDocumentDto,
  UpdateTrainingDocumentDto,
} from '../../entities/TrainingDocument';

export interface ITrainingDocumentRepository {
  /**
   * Döküman oluştur
   */
  create(data: CreateTrainingDocumentDto): Promise<TrainingDocument>;

  /**
   * ID ile döküman getir
   */
  findById(id: string): Promise<TrainingDocument | null>;

  /**
   * Eğitime ait dökümanları listele (sıraya göre)
   */
  findByTrainingId(trainingId: string): Promise<TrainingDocument[]>;

  /**
   * Döküman güncelle
   */
  update(id: string, data: UpdateTrainingDocumentDto): Promise<TrainingDocument>;

  /**
   * Döküman sil
   */
  delete(id: string): Promise<void>;

  /**
   * Eğitime ait tüm dökümanları sil
   */
  deleteByTrainingId(trainingId: string): Promise<void>;
}
