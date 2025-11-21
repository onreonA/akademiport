import {
  CompanyTaskDate,
  CreateCompanyTaskDateDto,
  UpdateCompanyTaskDateDto,
} from '../../entities/CompanyTaskDate';

export interface ICompanyTaskDateRepository {
  /** Yeni firma-görev tarih ataması oluştur */
  create(data: CreateCompanyTaskDateDto): Promise<CompanyTaskDate>;

  /** Birden fazla tarih atamasını tek seferde oluştur */
  createMany(data: CreateCompanyTaskDateDto[]): Promise<CompanyTaskDate[]>;

  /** ID ile tarih ataması getir */
  findById(id: string): Promise<CompanyTaskDate | null>;

  /** Firma ve görev bazında tarih ataması getir */
  findByCompanyAndTask(companyId: string, taskId: string): Promise<CompanyTaskDate | null>;

  /** Göreve bağlı tüm tarih atamalarını getir */
  findByTask(taskId: string): Promise<CompanyTaskDate[]>;

  /** Firmaya bağlı tüm tarih atamalarını getir */
  findByCompany(companyId: string): Promise<CompanyTaskDate[]>;

  /** Alt projeye bağlı tüm tarih atamalarını getir (görevler üzerinden) */
  findBySubProject(subProjectId: string): Promise<CompanyTaskDate[]>;

  /** Tarih atamasını güncelle */
  update(id: string, data: UpdateCompanyTaskDateDto): Promise<CompanyTaskDate>;

  /** Birden fazla tarih atamasını güncelle */
  updateMany(
    updates: Array<{ id: string; data: UpdateCompanyTaskDateDto }>
  ): Promise<CompanyTaskDate[]>;

  /** Tarih atamasını sil */
  delete(id: string): Promise<void>;

  /** Firma ve görev bağlantısını kaldır */
  deleteByCompanyAndTask(companyId: string, taskId: string): Promise<void>;

  /** Aynı kayıt mevcut mu kontrol et */
  exists(options: { companyId: string; taskId: string }): Promise<boolean>;
}
