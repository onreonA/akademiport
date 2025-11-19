/**
 * Unit Tests for CreateTaskCommentUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateTaskCommentUseCase } from './CreateTaskCommentUseCase';
import { ITaskCommentRepository } from '@/3-domain/interfaces/repositories/ITaskCommentRepository';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { TaskComment } from '@/3-domain/entities/TaskComment';

describe('CreateTaskCommentUseCase', () => {
  let mockCommentRepository: ITaskCommentRepository;
  let mockTaskRepository: ITaskRepository;
  let useCase: CreateTaskCommentUseCase;

  beforeEach(() => {
    mockCommentRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByTaskId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockTaskRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findBySubProject: vi.fn(),
      findByAssignedUser: vi.fn(),
      complete: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      assign: vi.fn(),
      assignTo: vi.fn(),
      exists: vi.fn(),
      findBySubProjectIds: vi.fn(),
    };

    useCase = new CreateTaskCommentUseCase(mockCommentRepository, mockTaskRepository);
  });

  const createValidDto = () => ({
    taskId: 'task-1',
    userId: 'user-1',
    comment: 'Test comment',
  });

  it('should create task comment successfully', async () => {
    const dto = createValidDto();
    const mockComment: TaskComment = {
      id: 'comment-1',
      taskId: dto.taskId,
      userId: dto.userId,
      comment: dto.comment,
      isQuestion: false,
      createdAt: new Date(),
    };

    vi.mocked(mockTaskRepository.exists).mockResolvedValue(true);
    vi.mocked(mockCommentRepository.create).mockResolvedValue(mockComment);

    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.id).toBe('comment-1');
    expect(mockTaskRepository.exists).toHaveBeenCalledWith(dto.taskId);
    expect(mockCommentRepository.create).toHaveBeenCalledWith(dto);
  });

  it('should fail when task does not exist', async () => {
    const dto = createValidDto();

    vi.mocked(mockTaskRepository.exists).mockResolvedValue(false);

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Task not found');
    expect(result.error?.statusCode).toBe(404);
    expect(mockCommentRepository.create).not.toHaveBeenCalled();
  });

  it('should fail when validation fails', async () => {
    const dto = {
      taskId: '',
      userId: 'user-1',
      comment: 'Test comment',
    };

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error?.statusCode).toBe(400);
    expect(mockTaskRepository.exists).not.toHaveBeenCalled();
    expect(mockCommentRepository.create).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const dto = createValidDto();
    const errorMessage = 'Database error';

    vi.mocked(mockTaskRepository.exists).mockResolvedValue(true);
    vi.mocked(mockCommentRepository.create).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect(result.error?.statusCode).toBe(500);
  });
});
