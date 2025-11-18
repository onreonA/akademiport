/**
 * Dashboard Stats Entity
 * Sprint 27: Dashboard & Analytics
 */

export interface UserGrowthData {
  month: string;
  users: number;
  growth: number;
}

export interface ProgramActivityData {
  programName: string;
  companies: number;
  projects: number;
  users: number;
}

export interface CompanyDistributionData {
  name: string;
  value: number;
}

export interface TaskCompletionData {
  date: string;
  completed: number;
  pending: number;
  total: number;
  completionRate: number;
}

export interface DashboardStats {
  // Summary stats
  totalPrograms: number;
  activeCompanies: number;
  totalUsers: number;
  completedTasks: number;
  pendingTasks: number;
  monthlyGrowth: number;

  // Chart data
  userGrowth: UserGrowthData[];
  programActivity: ProgramActivityData[];
  companyDistribution: CompanyDistributionData[];
  taskCompletion: TaskCompletionData[];
}

export interface ConsultantDashboardStats {
  totalCompanies: number;
  totalProjects: number;
  completedProjects: number;
  activeProjects: number;
  totalTrainings: number;
  completedTrainings: number;
  totalEvents: number;
  upcomingEvents: number;

  // Chart data
  companyPerformance: Array<{
    companyName: string;
    projects: number;
    completedProjects: number;
    completionRate: number;
  }>;
  projectProgress: Array<{
    projectName: string;
    progress: number;
    status: string;
  }>;
  trainingCompletion: Array<{
    trainingName: string;
    completed: number;
    total: number;
    completionRate: number;
  }>;
}

export interface CompanyDashboardStats {
  totalProjects: number;
  completedProjects: number;
  activeProjects: number;
  totalTrainings: number;
  completedTrainings: number;
  totalEvents: number;
  upcomingEvents: number;

  // Chart data
  projectProgress: Array<{
    projectName: string;
    progress: number;
    status: string;
  }>;
  trainingProgress: Array<{
    trainingName: string;
    progress: number;
    completed: boolean;
  }>;
  ecommerceMetrics: Array<{
    month: string;
    revenue: number;
    orders: number;
    visitors: number;
  }>;
}
