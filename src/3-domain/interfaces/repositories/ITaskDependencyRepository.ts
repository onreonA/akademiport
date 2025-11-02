import {
  TaskDependency,
  CreateTaskDependencyDto,
  UpdateTaskDependencyDto,
} from '../../entities/TaskDependency';

export interface ITaskDependencyRepository {
  /**
   * Bağımlılık oluştur
   */
  create(data: CreateTaskDependencyDto): Promise<TaskDependency>;

  /**
   * ID ile bağımlılık getir
   */
  findById(id: string): Promise<TaskDependency | null>;

  /**
   * Göreve ait bağımlılıkları getir (bu görev hangi görevlere bağımlı)
   */
  findByTaskId(taskId: string): Promise<TaskDependency[]>;

  /**
   * Görevin bağımlı olduğu görevleri getir (bu görev hangi görevlerden bağımlı)
   */
  findDependenciesOfTask(taskId: string): Promise<TaskDependency[]>;

  /**
   * Görevin bağımlı olan görevleri getir (bu göreve hangi görevler bağımlı)
   */
  findDependentTasks(taskId: string): Promise<TaskDependency[]>;

  /**
   * Belirli bir bağımlılık var mı kontrol et
   */
  exists(taskId: string, dependsOnTaskId: string): Promise<boolean>;

  /**
   * Circular dependency kontrolü
   */
  checkCircularDependency(taskId: string, dependsOnTaskId: string): Promise<boolean>;

  /**
   * Bağımlılık güncelle
   */
  update(id: string, data: UpdateTaskDependencyDto): Promise<TaskDependency>;

  /**
   * Bağımlılık sil
   */
  delete(id: string): Promise<void>;

  /**
   * Göreve ait tüm bağımlılıkları sil
   */
  deleteByTaskId(taskId: string): Promise<void>;
}
