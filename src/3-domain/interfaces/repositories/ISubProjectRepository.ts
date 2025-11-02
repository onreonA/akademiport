import { SubProject, CreateSubProjectDto, UpdateSubProjectDto } from '../../entities/SubProject';

export interface ISubProjectRepository {
  /**
   * Alt proje oluştur
   */
  create(data: CreateSubProjectDto): Promise<SubProject>;

  /**
   * ID ile alt proje getir
   */
  findById(id: string): Promise<SubProject | null>;

  /**
   * Projeye ait alt projeleri getir
   */
  findByProjectId(projectId: string): Promise<SubProject[]>;

  /**
   * Alt proje güncelle
   */
  update(id: string, data: UpdateSubProjectDto): Promise<SubProject>;

  /**
   * Alt proje sil (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Silinen alt projeyi geri yükle
   */
  restore(id: string): Promise<void>;

  /**
   * Silinen alt projeleri getir
   */
  findDeleted(): Promise<SubProject[]>;

  /**
   * Alt proje var mı kontrol et
   */
  exists(id: string, includeDeleted?: boolean): Promise<boolean>;

  /**
   * Alt proje ilerlemesini güncelle
   */
  updateProgress(id: string, progress: number): Promise<void>;

  /**
   * Alt proje sıralamasını güncelle
   */
  updateOrder(id: string, orderIndex: number): Promise<void>;
}
