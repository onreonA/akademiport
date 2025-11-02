/**
 * TaskDependency Entity
 * Görev bağımlılıkları entity'si - Bir görevin hangi görevlere bağımlı olduğunu belirtir
 */

export type DependencyType = 'blocks' | 'related';

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  dependencyType: DependencyType;
  createdAt: Date;
}

export interface CreateTaskDependencyDto {
  taskId: string;
  dependsOnTaskId: string;
  dependencyType?: DependencyType;
}

export interface UpdateTaskDependencyDto {
  dependencyType?: DependencyType;
}

/**
 * TaskDependency Business Logic
 */
export class TaskDependencyEntity implements TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  dependencyType: DependencyType;
  createdAt: Date;

  constructor(data: TaskDependency) {
    this.id = data.id;
    this.taskId = data.taskId;
    this.dependsOnTaskId = data.dependsOnTaskId;
    this.dependencyType = data.dependencyType;
    this.createdAt = data.createdAt;
  }

  /**
   * Zorunlu bağımlılık mı? (blocks)
   */
  isBlocking(): boolean {
    return this.dependencyType === 'blocks';
  }

  /**
   * Opsiyonel bağımlılık mı? (related)
   */
  isRelated(): boolean {
    return this.dependencyType === 'related';
  }

  /**
   * Bağımlılık tipini değiştir
   */
  changeType(type: DependencyType): void {
    this.dependencyType = type;
  }

  /**
   * Validation
   */
  static validate(data: CreateTaskDependencyDto): string[] {
    const errors: string[] = [];

    if (!data.taskId || data.taskId.trim().length === 0) {
      errors.push('Task ID is required');
    }

    if (!data.dependsOnTaskId || data.dependsOnTaskId.trim().length === 0) {
      errors.push('Depends on Task ID is required');
    }

    if (data.taskId === data.dependsOnTaskId) {
      errors.push('Task cannot depend on itself (self-dependency not allowed)');
    }

    if (data.dependencyType && !['blocks', 'related'].includes(data.dependencyType)) {
      errors.push('Dependency type must be either "blocks" or "related"');
    }

    return errors;
  }
}
