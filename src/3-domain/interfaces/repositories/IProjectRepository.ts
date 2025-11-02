import { Project, CreateProjectDto, UpdateProjectDto } from '../../entities/Project';

export interface IProjectRepository {
  /**
   * Proje oluştur
   */
  create(data: CreateProjectDto): Promise<Project>;

  /**
   * ID ile proje getir
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Tüm projeleri listele
   */
  findAll(filters?: {
    companyId?: string;
    consultantId?: string;
    status?: string;
    isTemplate?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: Project[]; total: number }>;

  /**
   * Firmaya ait projeleri getir
   */
  findByCompanyId(companyId: string): Promise<Project[]>;

  /**
   * Danışmana ait projeleri getir
   */
  findByConsultantId(consultantId: string): Promise<Project[]>;

  /**
   * Şablonları getir
   */
  findTemplates(): Promise<Project[]>;

  /**
   * Şablondan oluşturulmuş projeleri getir
   */
  findByTemplateId(templateId: string): Promise<Project[]>;

  /**
   * Proje güncelle
   */
  update(id: string, data: UpdateProjectDto): Promise<Project>;

  /**
   * Proje sil (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Silinen projeyi geri yükle
   */
  restore(id: string): Promise<void>;

  /**
   * Silinen projeleri getir
   */
  findDeleted(): Promise<Project[]>;

  /**
   * Proje var mı kontrol et
   */
  exists(id: string, includeDeleted?: boolean): Promise<boolean>;

  /**
   * Proje ilerlemesini güncelle
   */
  updateProgress(id: string, progress: number): Promise<void>;
}
