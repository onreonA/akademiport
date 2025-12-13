/**
 * Unit Tests for GetConsultantDashboardStatsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetConsultantDashboardStatsUseCase } from './GetConsultantDashboardStatsUseCase';
import { Result } from '@/6-core/result/Result';
import { setupTestIsolation } from '@/shared/test/test-isolation';

// Mock repositories
const mockUserRepository = {
  findAll: vi.fn(),
};

const mockCompanyRepository = {
  findAll: vi.fn(),
};

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

describe('GetConsultantDashboardStatsUseCase', () => {
  let useCase: GetConsultantDashboardStatsUseCase;

  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = new GetConsultantDashboardStatsUseCase(
      mockUserRepository as any,
      mockCompanyRepository as any,
      mockProjectRepository as any,
      mockTrainingRepository as any,
      mockCompanyTrainingRepository as any,
      mockEventRepository as any
    );
  });

  describe('execute', () => {
    const consultantId = 'consultant-1';

    it('should return consultant dashboard stats successfully', async () => {
      // Mock companies
      mockCompanyRepository.findAll.mockResolvedValue(
        Result.ok([
          { id: 'company-1', name: 'Company 1' },
          { id: 'company-2', name: 'Company 2' },
        ])
      );

      // Mock projects for consultant
      mockProjectRepository.findAll.mockResolvedValue({
        data: [
          {
            id: 'project-1',
            name: 'Project 1',
            companyId: 'company-1',
            status: 'done',
            progress: 100,
          },
          {
            id: 'project-2',
            name: 'Project 2',
            companyId: 'company-1',
            status: 'in_progress',
            progress: 50,
          },
          {
            id: 'project-3',
            name: 'Project 3',
            companyId: 'company-2',
            status: 'todo',
            progress: 0,
          },
        ],
      });

      // Mock trainings
      mockTrainingRepository.findAll.mockResolvedValue({
        data: [
          { id: 'training-1', name: 'Training 1' },
          { id: 'training-2', name: 'Training 2' },
        ],
      });

      // Mock company trainings
      mockCompanyTrainingRepository.findByCompanyId.mockResolvedValue([
        { id: 'ct-1', trainingId: 'training-1', status: 'completed' },
        { id: 'ct-2', trainingId: 'training-2', status: 'in_progress' },
      ]);

      // Mock events
      mockEventRepository.findAll.mockResolvedValue({
        data: [
          {
            id: 'event-1',
            startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          },
        ],
      });

      const result = await useCase.execute(consultantId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.totalCompanies).toBe(2);
        expect(result.value.totalProjects).toBe(3);
        expect(result.value.completedProjects).toBe(1);
        expect(result.value.activeProjects).toBe(2);
        expect(result.value.totalTrainings).toBe(2);
        expect(result.value.completedTrainings).toBe(2); // 2 companies * 1 completed each
        expect(result.value.upcomingEvents).toBe(1);
        expect(result.value.companyPerformance).toBeDefined();
        expect(result.value.projectProgress).toBeDefined();
        expect(result.value.trainingCompletion).toBeDefined();
      }
    });

    it('should filter companies by consultant projects', async () => {
      mockCompanyRepository.findAll.mockResolvedValue(
        Result.ok([
          { id: 'company-1', name: 'Company 1' },
          { id: 'company-2', name: 'Company 2' },
          { id: 'company-3', name: 'Company 3' }, // Not assigned to consultant
        ])
      );

      mockProjectRepository.findAll.mockResolvedValue({
        data: [
          { id: 'project-1', companyId: 'company-1' },
          { id: 'project-2', companyId: 'company-2' },
        ],
      });

      mockTrainingRepository.findAll.mockResolvedValue({ data: [] });
      mockCompanyTrainingRepository.findByCompanyId.mockResolvedValue([]);
      mockEventRepository.findAll.mockResolvedValue({ data: [] });

      const result = await useCase.execute(consultantId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        // Should only count companies with projects assigned to consultant
        expect(result.value.totalCompanies).toBe(2);
      }
    });

    it('should handle company repository failure', async () => {
      mockCompanyRepository.findAll.mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(consultantId);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        // Use case returns "Firmalar alınamadı" when company repository fails
        const errorMessage =
          typeof result.error === 'string' ? result.error : result.error?.message || '';
        expect(errorMessage).toContain('Firmalar alınamadı');
      }
    });

    it('should calculate company performance correctly', async () => {
      mockCompanyRepository.findAll.mockResolvedValue(
        Result.ok([{ id: 'company-1', name: 'Company 1' }])
      );

      mockProjectRepository.findAll.mockResolvedValue({
        data: [
          { id: 'project-1', companyId: 'company-1', status: 'done' },
          { id: 'project-2', companyId: 'company-1', status: 'done' },
          { id: 'project-3', companyId: 'company-1', status: 'in_progress' },
        ],
      });

      mockTrainingRepository.findAll.mockResolvedValue({ data: [] });
      mockCompanyTrainingRepository.findByCompanyId.mockResolvedValue([]);
      mockEventRepository.findAll.mockResolvedValue({ data: [] });

      const result = await useCase.execute(consultantId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.companyPerformance).toBeDefined();
        expect(result.value.companyPerformance.length).toBeGreaterThan(0);
        expect(result.value.companyPerformance[0]).toHaveProperty('companyName');
        expect(result.value.companyPerformance[0]).toHaveProperty('projects');
        expect(result.value.companyPerformance[0]).toHaveProperty('completedProjects');
        expect(result.value.companyPerformance[0]).toHaveProperty('completionRate');
      }
    });

    it('should handle empty data gracefully', async () => {
      mockCompanyRepository.findAll.mockResolvedValue(Result.ok([]));
      mockProjectRepository.findAll.mockResolvedValue({ data: [] });
      mockTrainingRepository.findAll.mockResolvedValue({ data: [] });
      mockCompanyTrainingRepository.findByCompanyId.mockResolvedValue([]);
      mockEventRepository.findAll.mockResolvedValue({ data: [] });

      const result = await useCase.execute(consultantId);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.totalCompanies).toBe(0);
        expect(result.value.totalProjects).toBe(0);
        expect(result.value.completedProjects).toBe(0);
        expect(result.value.activeProjects).toBe(0);
      }
    });

    it('should handle errors and return failure result', async () => {
      mockCompanyRepository.findAll.mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(consultantId);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeDefined();
      }
    });
  });
});

