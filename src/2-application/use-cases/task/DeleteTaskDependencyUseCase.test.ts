/**
 * Unit Tests for DeleteTaskDependencyUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteTaskDependencyUseCase } from './DeleteTaskDependencyUseCase';
import { ITaskDependencyRepository } from '@/3-domain/interfaces/repositories/ITaskDependencyRepository';
import { Result } from '@/6-core/result/Result';
import type { TaskDependency } from '@/3-domain/entities/TaskDependency';

describe('DeleteTaskDependencyUseCase', () => {
  let mockRepository: ITaskDependencyRepository;
  let useCase: DeleteTaskDependencyUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByTaskId: vi.fn(),
      findDependenciesOfTask: vi.fn(),
      findDependentTasks: vi.fn(),
      exists: vi.fn(),
      checkCircularDependency: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteByTaskId: vi.fn(),
    } as any;

    useCase = new DeleteTaskDependencyUseCase(mockRepository);
  });

  const createMockDependency = (overrides?: Partial<TaskDependency>): TaskDependency => {
    return {
      id: 'dependency-1',
      taskId: 'task-1',
      dependsOnTaskId: 'task-2',
      dependencyType: 'blocks',
      createdAt: new Date(),
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should delete dependency successfully', async () => {
      const dependencyId = 'dependency-1';
      const mockDependency = createMockDependency({ id: dependencyId });

      vi.mocked(mockRepository.findById).mockResolvedValue(mockDependency);
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

      const result = await useCase.execute(dependencyId);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(dependencyId);
      expect(mockRepository.delete).toHaveBeenCalledWith(dependencyId);
    });

    it('should return error when dependency not found', async () => {
      const dependencyId = 'non-existent-dependency';

      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      const result = await useCase.execute(dependencyId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('not found');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const dependencyId = 'dependency-1';

      vi.mocked(mockRepository.findById).mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute(dependencyId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
