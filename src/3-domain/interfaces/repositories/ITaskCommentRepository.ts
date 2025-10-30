import { TaskComment, CreateTaskCommentDto } from '../../entities/TaskComment';

export interface ITaskCommentRepository {
  /**
   * Yorum oluştur
   */
  create(data: CreateTaskCommentDto): Promise<TaskComment>;

  /**
   * ID ile yorum getir
   */
  findById(id: string): Promise<TaskComment | null>;

  /**
   * Göreve ait yorumları getir
   */
  findByTaskId(taskId: string): Promise<TaskComment[]>;

  /**
   * Kullanıcının yorumlarını getir
   */
  findByUserId(userId: string): Promise<TaskComment[]>;

  /**
   * Yorum sil
   */
  delete(id: string): Promise<void>;

  /**
   * Yorum var mı kontrol et
   */
  exists(id: string): Promise<boolean>;
}
