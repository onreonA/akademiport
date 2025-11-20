/**
 * Unit Tests for ListTaskCommentsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListTaskCommentsUseCase } from './ListTaskCommentsUseCase';
import { ITaskCommentRepository } from '@/3-domain/interfaces/repositories/ITaskCommentRepository';
import { TaskComment } from '@/3-domain/entities/TaskComment';
import { AppError } from '@/6-core/errors/AppError';

describe('ListTaskCommentsUseCase', () => {
  let mockRepository: ITaskCommentRepository;
  let useCase: ListTaskCommentsUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByTaskId: vi.fn(),
      findByUserId: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    } as any;

    useCase = new ListTaskCommentsUseCase(mockRepository);
  });

  const createMockComment = (overrides?: Partial<TaskComment>): TaskComment => {
    return {
      id: 'comment-1',
      taskId: 'task-1',
      userId: 'user-1',
      comment: 'Test comment',
      isQuestion: false,
      createdAt: new Date(),
      ...overrides,
    };
  };

  it('should list task comments successfully', async () => {
    const taskId = 'task-1';
    const mockComments = [
      createMockComment({ id: 'comment-1' }),
      createMockComment({ id: 'comment-2' }),
    ];

    vi.mocked(mockRepository.findByTaskId).mockResolvedValue(mockComments);

    const result = await useCase.execute(taskId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockComments);
    expect(mockRepository.findByTaskId).toHaveBeenCalledWith(taskId);
  });

  it('should return empty array when no comments', async () => {
    const taskId = 'task-1';

    vi.mocked(mockRepository.findByTaskId).mockResolvedValue([]);

    const result = await useCase.execute(taskId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual([]);
  });

  it('should handle repository errors', async () => {
    const taskId = 'task-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findByTaskId).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(taskId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect((result.error as AppError)?.statusCode).toBe(500);
  });
});
