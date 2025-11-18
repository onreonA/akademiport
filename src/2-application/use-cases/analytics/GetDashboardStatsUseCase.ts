/**
 * Get Dashboard Stats Use Case
 * Sprint 27: Dashboard & Analytics
 */

import { Result } from '@/6-core/result/Result';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { IProgramRepository } from '@/3-domain/interfaces/IProgramRepository';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import {
  DashboardStats,
  UserGrowthData,
  ProgramActivityData,
  CompanyDistributionData,
  TaskCompletionData,
} from '@/3-domain/entities/DashboardStats';

export class GetDashboardStatsUseCase {
  constructor(
    private userRepository: IUserRepository,
    private companyRepository: ICompanyRepository,
    private programRepository: IProgramRepository,
    private projectRepository: IProjectRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(): Promise<Result<DashboardStats>> {
    try {
      // Get summary stats
      const totalProgramsResult = await this.programRepository.findAll();
      const totalPrograms = totalProgramsResult.isSuccess ? totalProgramsResult.value.length : 0;

      const allCompaniesResult = await this.companyRepository.findAll();
      const activeCompanies = allCompaniesResult.isSuccess
        ? allCompaniesResult.value.filter((c) => c.isActive).length
        : 0;

      const allUsersResult = await this.userRepository.findAll();
      const totalUsers = allUsersResult.isSuccess ? allUsersResult.value.length : 0;

      // Get user growth data (last 6 months)
      const userGrowth = await this.getUserGrowthData();

      // Get program activity data
      const programActivity = await this.getProgramActivityData();

      // Get company distribution data
      const companyDistribution = await this.getCompanyDistributionData();

      // Get task completion data (last 30 days)
      const taskCompletion = await this.getTaskCompletionData();

      // Calculate task stats
      const completedTasks = taskCompletion.reduce((sum, item) => sum + item.completed, 0);
      const pendingTasks = taskCompletion.reduce((sum, item) => sum + item.pending, 0);

      // Calculate monthly growth
      const monthlyGrowth =
        userGrowth.length > 1
          ? ((userGrowth[userGrowth.length - 1].users - userGrowth[0].users) /
              userGrowth[0].users) *
            100
          : 0;

      const stats: DashboardStats = {
        totalPrograms,
        activeCompanies,
        totalUsers,
        completedTasks,
        pendingTasks,
        monthlyGrowth,
        userGrowth,
        programActivity,
        companyDistribution,
        taskCompletion,
      };

      return Result.ok(stats);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Dashboard istatistikleri alınamadı'
      );
    }
  }

  private async getUserGrowthData(): Promise<UserGrowthData[]> {
    try {
      const supabase = await createClient();
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      // Get users created in last 6 months grouped by month
      const { data, error } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching user growth:', error);
        return this.generateMockUserGrowth();
      }

      // Group by month
      const monthlyData = new Map<string, number>();
      const months: string[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
        months.push(monthKey);
        monthlyData.set(monthKey, 0);
      }

      // Count users per month
      data?.forEach((user) => {
        const monthKey = user.created_at.substring(0, 7);
        if (monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
        }
      });

      // Calculate cumulative users and growth
      let cumulativeUsers = 0;
      const result: UserGrowthData[] = [];

      months.forEach((month, index) => {
        const newUsers = monthlyData.get(month) || 0;
        cumulativeUsers += newUsers;

        const prevMonthUsers = index > 0 ? result[index - 1].users : cumulativeUsers - newUsers;

        const growth = prevMonthUsers > 0 ? (newUsers / prevMonthUsers) * 100 : 0;

        result.push({
          month,
          users: cumulativeUsers,
          growth: Math.round(growth * 100) / 100,
        });
      });

      return result;
    } catch (error) {
      console.error('Error in getUserGrowthData:', error);
      return this.generateMockUserGrowth();
    }
  }

  private generateMockUserGrowth(): UserGrowthData[] {
    const months: UserGrowthData[] = [];
    const now = new Date();
    let cumulativeUsers = 100;

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const newUsers = Math.floor(Math.random() * 20) + 5;
      cumulativeUsers += newUsers;
      const growth = Math.random() * 10 + 5;

      months.push({
        month: date.toISOString().substring(0, 7),
        users: cumulativeUsers,
        growth: Math.round(growth * 100) / 100,
      });
    }

    return months;
  }

  private async getProgramActivityData(): Promise<ProgramActivityData[]> {
    try {
      const programsResult = await this.programRepository.findAll();
      if (programsResult.isFailure) {
        return [];
      }

      const programs = programsResult.value;
      const result: ProgramActivityData[] = [];

      for (const program of programs) {
        const companiesResult = await this.companyRepository.findByProgramId(program.id);
        const companies = companiesResult.isSuccess ? companiesResult.value.length : 0;

        const projectsResult = await this.projectRepository.findAll({
          consultantId: undefined,
          limit: 1000,
        });
        const projects = projectsResult.data.filter((p) => p.programId === program.id).length;

        const usersResult = await this.userRepository.findByProgramId(program.id);
        const users = usersResult.isSuccess ? usersResult.value.length : 0;

        result.push({
          programName: program.name,
          companies,
          projects,
          users,
        });
      }

      return result.slice(0, 10); // Top 10 programs
    } catch (error) {
      console.error('Error in getProgramActivityData:', error);
      return [];
    }
  }

  private async getCompanyDistributionData(): Promise<CompanyDistributionData[]> {
    try {
      const companiesResult = await this.companyRepository.findAll();
      if (companiesResult.isFailure) {
        return [];
      }

      const companies = companiesResult.value;
      const active = companies.filter((c) => c.isActive).length;
      const inactive = companies.length - active;

      return [
        { name: 'Aktif', value: active },
        { name: 'Pasif', value: inactive },
      ];
    } catch (error) {
      console.error('Error in getCompanyDistributionData:', error);
      return [
        { name: 'Aktif', value: 0 },
        { name: 'Pasif', value: 0 },
      ];
    }
  }

  private async getTaskCompletionData(): Promise<TaskCompletionData[]> {
    try {
      const supabase = await createClient();
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      // Get tasks created in last 30 days
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('created_at, status')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching task completion:', error);
        return this.generateMockTaskCompletion();
      }

      // Group by date
      const dailyData = new Map<string, { completed: number; pending: number }>();
      const dates: string[] = [];

      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().substring(0, 10); // YYYY-MM-DD
        dates.push(dateKey);
        dailyData.set(dateKey, { completed: 0, pending: 0 });
      }

      // Count tasks by status
      tasks?.forEach((task) => {
        const dateKey = task.created_at.substring(0, 10);
        if (dailyData.has(dateKey)) {
          const data = dailyData.get(dateKey)!;
          if (task.status === 'completed') {
            data.completed++;
          } else {
            data.pending++;
          }
        }
      });

      // Calculate cumulative and completion rate
      let cumulativeCompleted = 0;
      let cumulativePending = 0;
      const result: TaskCompletionData[] = [];

      dates.forEach((date) => {
        const dayData = dailyData.get(date)!;
        cumulativeCompleted += dayData.completed;
        cumulativePending += dayData.pending;
        const total = cumulativeCompleted + cumulativePending;
        const completionRate = total > 0 ? (cumulativeCompleted / total) * 100 : 0;

        result.push({
          date,
          completed: cumulativeCompleted,
          pending: cumulativePending,
          total,
          completionRate: Math.round(completionRate * 100) / 100,
        });
      });

      return result;
    } catch (error) {
      console.error('Error in getTaskCompletionData:', error);
      return this.generateMockTaskCompletion();
    }
  }

  private generateMockTaskCompletion(): TaskCompletionData[] {
    const result: TaskCompletionData[] = [];
    const now = new Date();
    let completed = 50;
    let pending = 20;

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      completed += Math.floor(Math.random() * 3);
      pending += Math.floor(Math.random() * 2);
      const total = completed + pending;
      const completionRate = (completed / total) * 100;

      result.push({
        date: date.toISOString().substring(0, 10),
        completed,
        pending,
        total,
        completionRate: Math.round(completionRate * 100) / 100,
      });
    }

    return result;
  }
}
