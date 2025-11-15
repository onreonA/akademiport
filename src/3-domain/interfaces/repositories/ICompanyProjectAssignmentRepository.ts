import {
  CompanyProjectAssignment,
  CreateCompanyProjectAssignmentDto,
  UpdateCompanyProjectAssignmentDto,
} from '../../entities/CompanyProjectAssignment';

export interface ICompanyProjectAssignmentRepository {
  /** Yeni firma-proje ataması oluştur */
  create(data: CreateCompanyProjectAssignmentDto): Promise<CompanyProjectAssignment>;

  /** Birden fazla atamayı tek seferde oluştur */
  createMany(data: CreateCompanyProjectAssignmentDto[]): Promise<CompanyProjectAssignment[]>;

  /** ID ile atama getir */
  findById(id: string): Promise<CompanyProjectAssignment | null>;

  /** Firma ve proje bazında tüm atamaları getir */
  findByCompanyAndProject(
    companyId: string,
    projectId: string
  ): Promise<CompanyProjectAssignment[]>;

  /** Projeye bağlı tüm atamaları getir */
  findByProject(projectId: string): Promise<CompanyProjectAssignment[]>;

  /** Alt projeye bağlı tüm atamaları getir */
  findBySubProject(subProjectId: string): Promise<CompanyProjectAssignment[]>;

  /** Atamayı güncelle */
  update(id: string, data: UpdateCompanyProjectAssignmentDto): Promise<CompanyProjectAssignment>;

  /** Birden fazla atamayı güncelle */
  updateMany(
    updates: Array<{ id: string; data: UpdateCompanyProjectAssignmentDto }>
  ): Promise<CompanyProjectAssignment[]>;

  /** Atamayı sil */
  delete(id: string): Promise<void>;

  /** Firma ve alt proje bağlantısını kaldır */
  deleteByCompanyAndSubProject(companyId: string, subProjectId: string): Promise<void>;

  /** Aynı kayıt mevcut mu kontrol et */
  exists(options: {
    companyId: string;
    projectId: string;
    subProjectId?: string | null;
  }): Promise<boolean>;
}

