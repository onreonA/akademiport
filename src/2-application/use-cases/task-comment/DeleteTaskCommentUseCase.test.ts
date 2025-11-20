/**
 * Unit Tests for DeleteTaskCommentUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteTaskCommentUseCase } from './DeleteTaskCommentUseCase';
import { ITaskCommentRepository } from '@/3-domain/interfaces/repositories/ITaskCommentRepository';
import { AppError } from '@/6-core/errors/AppError';

describe('DeleteTaskCommentUseCase', () => {
  let mockRepository: ITaskCommentRepository;
  let useCase: DeleteTaskCommentUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByTaskId: vi.fn(),
      findByUserId: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    } as any;

    useCase = new DeleteTaskCommentUseCase(mockRepository);
  });

  it('should delete task comment successfully', async () => {
    const commentId = 'comment-1';

    vi.mocked(mockRepository.exists).mockResolvedValue(true);
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

    const result = await useCase.execute(commentId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.exists).toHaveBeenCalledWith(commentId);
    expect(mockRepository.delete).toHaveBeenCalledWith(commentId);
  });

  it('should fail when comment does not exist', async () => {
    const commentId = 'non-existent';

    vi.mocked(mockRepository.exists).mockResolvedValue(false);

    const result = await useCase.execute(commentId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Task comment not found');
    expect((result.error as AppError)?.statusCode).toBe(404);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const commentId = 'comment-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.exists).mockResolvedValue(true);
    vi.mocked(mockRepository.delete).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(commentId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect((result.error as AppError)?.statusCode).toBe(500);
  });

  it('should handle exists check errors', async () => {
    const commentId = 'comment-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.exists).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(commentId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect((result.error as AppError)?.statusCode).toBe(500);
  });
});
