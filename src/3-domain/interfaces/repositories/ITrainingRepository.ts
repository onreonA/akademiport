import {
  Training,
  CreateTrainingDto,
  UpdateTrainingDto,
  TrainingFilterDto,
} from '../../entities/Training';

export interface ITrainingRepository {
  /**
   * Eğitim oluştur
   */
  create(data: CreateTrainingDto): Promise<Training>;

  /**
   * ID ile eğitim getir
   */
  findById(id: string): Promise<Training | null>;

  /**
   * Tüm eğitimleri listele (filtreleme ile)
   */
  findAll(filters?: TrainingFilterDto): Promise<{ data: Training[]; total: number }>;

  /**
   * Programa ait eğitimleri getir
   */
  findByProgramId(programId: string): Promise<Training[]>;

  /**
   * Danışmana ait eğitimleri getir
   */
  findByConsultantId(consultantId: string): Promise<Training[]>;

  /**
   * Global eğitimleri getir
   */
  findGlobal(): Promise<Training[]>;

  /**
   * Eğitim güncelle
   */
  update(id: string, data: UpdateTrainingDto): Promise<Training>;

  /**
   * Eğitim sil
   */
  delete(id: string): Promise<void>;
}
