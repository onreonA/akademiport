/**
 * Leaderboard Score Entity
 */
export interface LeaderboardScore {
  id: string;
  companyId: string;
  programId: string;
  activityType: string;
  activityId: string | null;
  points: number;
  multiplier: number;
  finalPoints: number;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

/**
 * Badge Entity
 */
export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  requirementType: string;
  requirementValue: number;
  requirementActivity: string | null;
  pointsBonus: number;
  isActive: boolean;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Company Badge Entity
 */
export interface CompanyBadge {
  id: string;
  companyId: string;
  badgeId: string;
  earnedAt: Date;
}

/**
 * Leaderboard Ranking Entity
 */
export interface LeaderboardRanking {
  companyId: string;
  companyName: string;
  programId: string;
  totalScore: number;
  projectScore: number;
  trainingScore: number;
  eventScore: number;
  forumScore: number;
  newsScore: number;
  appointmentScore: number;
  rank: number;
  badgeCount: number;
  lastActivityAt: Date | null;
}

/**
 * Leaderboard History Entity
 */
export interface LeaderboardHistory {
  id: string;
  companyId: string;
  programId: string;
  snapshotDate: Date;
  totalScore: number;
  projectScore: number;
  trainingScore: number;
  eventScore: number;
  forumScore: number;
  newsScore: number;
  appointmentScore: number;
  rank: number;
  badgeCount: number;
  createdAt: Date;
}



