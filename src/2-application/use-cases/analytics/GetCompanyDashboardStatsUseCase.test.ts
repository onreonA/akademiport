/**
 * Unit Tests for GetCompanyDashboardStatsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetCompanyDashboardStatsUseCase } from './GetCompanyDashboardStatsUseCase';
import { Result } from '@/6-core/result/Result';
import { setupTestIsolation } from '@/shared/test/test-isolation';

// Mock repositories
const mockProjectRepository = {
  findAll: vi.fn(),
};

const mockTrainingRepository = {
  findAll: vi.fn(),
};

const mockCompanyTrainingRepository = {
  findByCompanyId: vi.fn(),
};

const mockEventRepository = {
  findAll: vi.fn(),
};

const mockEcommerceRepository = {
  listMetrics: vi.fn(),
};

describe('GetCompanyDashboardStatsUseCase', () => {
  let useCase: GetCompanyDashboardStatsUseCase;

  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = new GetCompanyDashboardStatsUseCase(
      mockProjectRepository as any,
      mockTrainingRepository as any,
      mockCompanyTrainingRepository as any,
      mockEventRepository as any,
      mockEcommerceRepository as any
    );
  });

  describe('execute', () => {
    const companyId = 'company-1';

    it('should return company dashboard stats successfully', async () => {
      // Mock project repository
      mockProjectRepository.findAll.mockResolvedValue({
        data: [
          { id: 'project-1', name: 'Project 1', status: 'done', progress: 100 },
          { id: 'project-2', name: 'Project 2', status: 'in_progress', progress: 50 },
          { id: 'project-3', name: 'Project 3', status: 'todo', progress: 0 },
        ],
      });

      // Mock company trainings
      mockCompanyTrainingRepository.findByCompanyId.mockResolvedValue([
        { id: 'ct-1', trainingId: 'training-1', status: 'completed' },
        { id: 'ct-2', trainingId: 'training-2', status: 'in_progress' },
      ]);

      // Mock trainings
      mockTrainingRepository.findAll.mockResolvedValue({
        data: [
          { id: 'training-1', name: 'Training 1' },
          { id: 'training-2', name: 'Training 2' },
        ],
      });

      // Mock events
      mockEventRepository.findAll.mockResolvedValue({
        data: [
          {
            id: 'event-1',
            startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          },
          {
            id: 'event-2',
            startTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          },
        ],
      });

      // Mock ecommerce metrics
      mockEcommerceRepository.listMetrics.mockResolvedValue(
        Result.ok([
          {
            id: 'metric-1',
            companyId,
            periodYear: 2025,
            periodMonth: 1,
            totalRevenue: 10000,
            totalOrders: 50,
            totalVisitors: 500,
          },
        ])
      );

      const result = await useCase.execute(companyId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.totalProjects).toBe(3);
        expect(result.value.completedProjects).toBe(1);
        expect(result.value.activeProjects).toBe(2);
        expect(result.value.totalTrainings).toBe(2);
        expect(result.value.completedTrainings).toBe(1);
        expect(result.value.upcomingEvents).toBe(1);
        expect(result.value.projectProgress).toBeDefined();
        expect(result.value.trainingProgress).toBeDefined();
        expect(result.value.ecommerceMetrics).toBeDefined();
      }
    });

    it('should handle empty data gracefully', async () => {
      mockProjectRepository.findAll.mockResolvedValue({ data: [] });
      mockCompanyTrainingRepository.findByCompanyId.mockResolvedValue([]);
      mockTrainingRepository.findAll.mockResolvedValue({ data: [] });
      mockEventRepository.findAll.mockResolvedValue({ data: [] });
      mockEcommerceRepository.listMetrics.mockResolvedValue(Result.ok([]));

      const result = await useCase.execute(companyId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.totalProjects).toBe(0);
        expect(result.value.completedProjects).toBe(0);
        expect(result.value.activeProjects).toBe(0);
        expect(result.value.totalTrainings).toBe(0);
        expect(result.value.completedTrainings).toBe(0);
      }
    });

    it('should handle ecommerce repository failure gracefully', async () => {
      mockProjectRepository.findAll.mockResolvedValue({ data: [] });
      mockCompanyTrainingRepository.findByCompanyId.mockResolvedValue([]);
      mockTrainingRepository.findAll.mockResolvedValue({ data: [] });
      mockEventRepository.findAll.mockResolvedValue({ data: [] });
      mockEcommerceRepository.listMetrics.mockResolvedValue(Result.fail('Ecommerce error'));

      const result = await useCase.execute(companyId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.ecommerceMetrics).toBeDefined();
        expect(Array.isArray(result.value.ecommerceMetrics)).toBe(true);
      }
    });

    it('should calculate project progress correctly', async () => {
      mockProjectRepository.findAll.mockResolvedValue({
        data: [
          { id: 'project-1', name: 'Project 1', status: 'done', progress: 100 },
          { id: 'project-2', name: 'Project 2', status: 'in_progress', progress: 75 },
        ],
      });
      mockCompanyTrainingRepository.findByCompanyId.mockResolvedValue([]);
      mockTrainingRepository.findAll.mockResolvedValue({ data: [] });
      mockEventRepository.findAll.mockResolvedValue({ data: [] });
      mockEcommerceRepository.listMetrics.mockResolvedValue(Result.ok([]));

      const result = await useCase.execute(companyId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.projectProgress.length).toBeGreaterThan(0);
        expect(result.value.projectProgress[0]).toHaveProperty('projectName');
        expect(result.value.projectProgress[0]).toHaveProperty('progress');
        expect(result.value.projectProgress[0]).toHaveProperty('status');
      }
    });

    it('should handle errors and return failure result', async () => {
      mockProjectRepository.findAll.mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(companyId);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeDefined();
      }
    });
  });
});

