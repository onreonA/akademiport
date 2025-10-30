import { Task, CreateTaskDto, UpdateTaskDto } from '../../entities/Task';

export interface ITaskRepository {
  /**
   * Görev oluştur
   */
  create(data: CreateTaskDto): Promise<Task>;

  /**
   * ID ile görev getir
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Alt projeye ait görevleri getir
   */
  findBySubProjectId(subProjectId: string): Promise<Task[]>;

  /**
   * Kullanıcıya atanmış görevleri getir
   */
  findByAssignedUserId(
    userId: string,
    filters?: {
      status?: string;
      priority?: string;
    }
  ): Promise<Task[]>;

  /**
   * Görev güncelle
   */
  update(id: string, data: UpdateTaskDto): Promise<Task>;

  /**
   * Görev sil
   */
  delete(id: string): Promise<void>;

  /**
   * Görev var mı kontrol et
   */
  exists(id: string): Promise<boolean>;

  /**
   * Görev durumunu güncelle
   */
  updateStatus(id: string, status: string): Promise<void>;

  /**
   * Görevi tamamla
   */
  complete(id: string): Promise<void>;

  /**
   * Görevi onayla
   */
  approve(id: string, approvedBy: string): Promise<void>;

  /**
   * Görevi reddet
   */
  reject(id: string): Promise<void>;

  /**
   * Görevi kullanıcıya ata
   */
  assignTo(id: string, userId: string): Promise<void>;

  /**
   * Görev sıralamasını güncelle
   */
  updateOrder(id: string, orderIndex: number): Promise<void>;
}
