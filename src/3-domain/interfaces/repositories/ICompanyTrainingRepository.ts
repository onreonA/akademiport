import {
  CompanyTraining,
  CreateCompanyTrainingDto,
  UpdateCompanyTrainingDto,
} from '../../entities/CompanyTraining';

export interface ICompanyTrainingRepository {
  /**
   * Firma-Eğitim atama oluştur
   */
  create(data: CreateCompanyTrainingDto): Promise<CompanyTraining>;

  /**
   * ID ile atama getir
   */
  findById(id: string): Promise<CompanyTraining | null>;

  /**
   * Firmaya ait eğitimleri getir
   */
  findByCompanyId(companyId: string): Promise<CompanyTraining[]>;

  /**
   * Eğitime atanan firmaları getir
   */
  findByTrainingId(trainingId: string): Promise<CompanyTraining[]>;

  /**
   * Firma ve eğitim ilişkisini getir
   */
  findByCompanyAndTraining(companyId: string, trainingId: string): Promise<CompanyTraining | null>;

  /**
   * Atama güncelle
   */
  update(id: string, data: UpdateCompanyTrainingDto): Promise<CompanyTraining>;

  /**
   * Atama sil
   */
  delete(id: string): Promise<void>;

  /**
   * Firma-Eğitim atamasını sil
   */
  deleteByCompanyAndTraining(companyId: string, trainingId: string): Promise<void>;
}
