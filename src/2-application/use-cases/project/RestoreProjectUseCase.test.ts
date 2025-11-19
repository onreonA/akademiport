/**
 * Unit Tests for RestoreProjectUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RestoreProjectUseCase } from './RestoreProjectUseCase';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';

describe('RestoreProjectUseCase', () => {
  let mockRepository: IProjectRepository;
  let useCase: RestoreProjectUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findTemplates: vi.fn(),
      updateProgress: vi.fn(),
      exists: vi.fn(),
      restore: vi.fn(),
    };

    useCase = new RestoreProjectUseCase(mockRepository);
  });

  it('should restore project successfully', async () => {
    const projectId = 'project-1';

    vi.mocked(mockRepository.restore).mockResolvedValue(undefined);

    const result = await useCase.execute(projectId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.restore).toHaveBeenCalledWith(projectId);
  });

  it('should handle repository errors', async () => {
    const projectId = 'project-1';
    const errorMessage = 'Project not found';

    vi.mocked(mockRepository.restore).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(projectId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect(result.error?.statusCode).toBe(500);
  });

  it('should handle exceptions', async () => {
    const projectId = 'project-1';
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.restore).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(projectId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });
});
