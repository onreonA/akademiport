import { Result } from '@/6-core/result/Result';
import {
  LeaderboardScore,
  Badge,
  CompanyBadge,
  LeaderboardRanking,
  LeaderboardHistory,
} from '@/3-domain/entities/Leaderboard';

export interface AddScoreParams {
  companyId: string;
  programId: string;
  activityType: string;
  activityId: string | null;
  points: number;
  multiplier: number;
  metadata: Record<string, any> | null;
}

export interface LeaderboardFilter {
  programId?: string;
  companyId?: string;
  limit?: number;
  offset?: number;
}

export interface BadgeFilter {
  category?: string;
  isActive?: boolean;
}

export interface HistoryFilter {
  companyId?: string;
  programId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ILeaderboardRepository {
  /**
   * Add a score to leaderboard
   */
  addScore(params: AddScoreParams): Promise<Result<void>>;

  /**
   * Refresh leaderboard rankings (materialized view)
   */
  refreshRankings(): Promise<Result<void>>;

  /**
   * Get leaderboard rankings
   */
  getRankings(filter?: LeaderboardFilter): Promise<Result<LeaderboardRanking[]>>;

  /**
   * Get company ranking
   */
  getCompanyRanking(companyId: string, programId: string): Promise<Result<LeaderboardRanking | null>>;

  /**
   * Get all badges
   */
  getBadges(filter?: BadgeFilter): Promise<Result<Badge[]>>;

  /**
   * Get badge by ID
   */
  getBadgeById(badgeId: string): Promise<Result<Badge | null>>;

  /**
   * Create badge (admin only)
   */
  createBadge(badge: Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Badge>>;

  /**
   * Update badge (admin only)
   */
  updateBadge(badgeId: string, updates: Partial<Badge>): Promise<Result<Badge>>;

  /**
   * Delete badge (admin only)
   */
  deleteBadge(badgeId: string): Promise<Result<void>>;

  /**
   * Get company badges
   */
  getCompanyBadges(companyId: string): Promise<Result<CompanyBadge[]>>;

  /**
   * Get company scores
   */
  getCompanyScores(companyId: string, limit?: number): Promise<Result<LeaderboardScore[]>>;

  /**
   * Get leaderboard history
   */
  getHistory(filter?: HistoryFilter): Promise<Result<LeaderboardHistory[]>>;

  /**
   * Create weekly snapshot
   */
  createSnapshot(): Promise<Result<void>>;

  /**
   * Get trend data for company
   */
  getCompanyTrend(companyId: string, programId: string, weeks?: number): Promise<Result<LeaderboardHistory[]>>;
}



