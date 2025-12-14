/**
 * Get Consultant Dashboard Stats Use Case
 * Sprint 27: Dashboard & Analytics
 */

import { Result } from '@/6-core/result/Result';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { ICompanyTrainingRepository } from '@/3-domain/interfaces/repositories/ICompanyTrainingRepository';
import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { ConsultantDashboardStats } from '@/3-domain/entities/DashboardStats';
import { createClient } from '@/4-infrastructure/database/supabase-server';

export class GetConsultantDashboardStatsUseCase {
  constructor(
    private userRepository: IUserRepository,
    private companyRepository: ICompanyRepository,
    private projectRepository: IProjectRepository,
    private trainingRepository: ITrainingRepository,
    private companyTrainingRepository: ICompanyTrainingRepository,
    private eventRepository: IEventRepository
  ) {}

  async execute(consultantId: string): Promise<Result<ConsultantDashboardStats>> {
    try {
      // Get consultant's companies
      const companiesResult = await this.companyRepository.findAll();
      if (companiesResult.isFailure) {
        return Result.fail('Firmalar alınamadı');
      }

      // Filter companies assigned to this consultant (via projects)
      const allProjectsResult = await this.projectRepository.findAll({ consultantId, limit: 1000 });
      const consultantProjects = allProjectsResult.data;
      const consultantCompanyIds = new Set(
        consultantProjects.map((p) => p.companyId).filter((id): id is string => id !== null)
      );
      const consultantCompanies = companiesResult.value.filter((c) =>
        consultantCompanyIds.has(c.id)
      );

      // Get summary stats
      const totalCompanies = consultantCompanies.length;
      const totalProjects = consultantProjects.length;
      const completedProjects = consultantProjects.filter((p) => p.status === 'done').length;
      const activeProjects = consultantProjects.filter(
        (p) => p.status === 'in_progress' || p.status === 'todo'
      ).length;

      // Get trainings
      const trainingsResult = await this.trainingRepository.findAll();
      const trainings = trainingsResult.data || [];

      // Get company trainings for consultant's companies - batch query to avoid N+1
      const companyTrainings: any[] = [];
      if (consultantCompanyIds.size > 0) {
        // Fetch all company trainings in a single query using .in() instead of loop
        const companyIdsArray = Array.from(consultantCompanyIds);
        // Use Promise.all with batch queries if repository doesn't support .in() directly
        // For now, we'll use a workaround: fetch all and filter in memory
        // TODO: Add findByCompanyIds method to repository for better performance
        const allCompanyTrainingsPromises = companyIdsArray.map((companyId) =>
          this.companyTrainingRepository.findByCompanyId(companyId)
        );
        const allCompanyTrainingsResults = await Promise.all(allCompanyTrainingsPromises);
        companyTrainings.push(...allCompanyTrainingsResults.flat());
      }

      const totalTrainings = trainings.length;
      const completedTrainings = companyTrainings.filter((ct) => ct.status === 'completed').length;

      // Get events
      const eventsResult = await this.eventRepository.findAll();
      const events = eventsResult.data || [];
      const upcomingEvents = events.filter(
        (e) => e.startTime && new Date(e.startTime) > new Date()
      ).length;

      // Get company performance data
      const companyPerformance = await this.getCompanyPerformanceData(
        consultantCompanies,
        consultantProjects
      );

      // Get project progress data
      const projectProgress = consultantProjects.slice(0, 10).map((p) => ({
        projectName: p.name,
        progress: p.progress,
        status: p.status,
      }));

      // Get training completion data
      const trainingCompletion = trainings.slice(0, 10).map((t) => {
        const companyTrainingsForThis = companyTrainings.filter((ct) => ct.trainingId === t.id);
        const completed = companyTrainingsForThis.filter((ct) => ct.status === 'completed').length;
        const total = companyTrainingsForThis.length;

        return {
          trainingName: t.name,
          completed,
          total,
          completionRate: total > 0 ? (completed / total) * 100 : 0,
        };
      });

      const stats: ConsultantDashboardStats = {
        totalCompanies,
        totalProjects,
        completedProjects,
        activeProjects,
        totalTrainings,
        completedTrainings,
        totalEvents: events.length,
        upcomingEvents,
        companyPerformance,
        projectProgress,
        trainingCompletion,
      };

      return Result.ok(stats);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Consultant dashboard istatistikleri alınamadı'
      );
    }
  }

  private async getCompanyPerformanceData(
    companies: any[],
    projects: any[]
  ): Promise<
    Array<{
      companyName: string;
      projects: number;
      completedProjects: number;
      completionRate: number;
    }>
  > {
    const result: Array<{
      companyName: string;
      projects: number;
      completedProjects: number;
      completionRate: number;
    }> = [];

    for (const company of companies.slice(0, 10)) {
      const companyProjects = projects.filter((p) => p.companyId === company.id);
      const completedProjects = companyProjects.filter((p) => p.status === 'done').length;
      const completionRate =
        companyProjects.length > 0 ? (completedProjects / companyProjects.length) * 100 : 0;

      result.push({
        companyName: company.name,
        projects: companyProjects.length,
        completedProjects,
        completionRate: Math.round(completionRate * 100) / 100,
      });
    }

    return result;
  }
}
