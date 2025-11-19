/**
 * Unit Tests for DeleteTaskUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteTaskUseCase } from './DeleteTaskUseCase';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';

describe('DeleteTaskUseCase', () => {
  let mockRepository: ITaskRepository;
  let useCase: DeleteTaskUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findBySubProject: vi.fn(),
      findByAssignedUser: vi.fn(),
      findBySubProjectId: vi.fn(),
      complete: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      assign: vi.fn(),
      exists: vi.fn(),
    };

    useCase = new DeleteTaskUseCase(mockRepository);
  });

  it('should delete task successfully', async () => {
    const taskId = 'task-1';

    vi.mocked(mockRepository.exists).mockResolvedValue(true);
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

    const result = await useCase.execute(taskId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.exists).toHaveBeenCalledWith(taskId);
    expect(mockRepository.delete).toHaveBeenCalledWith(taskId);
  });

  it('should return error when task not found', async () => {
    const taskId = 'non-existent';

    vi.mocked(mockRepository.exists).mockResolvedValue(false);

    const result = await useCase.execute(taskId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Task not found');
    expect(result.error?.statusCode).toBe(404);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const taskId = 'task-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.exists).mockResolvedValue(true);
    vi.mocked(mockRepository.delete).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(taskId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect(result.error?.statusCode).toBe(500);
  });
});
