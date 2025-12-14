import { createClient, getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { Result } from '@/6-core/result/Result';
import {
  ILeaderboardRepository,
  AddScoreParams,
  LeaderboardFilter,
  BadgeFilter,
  HistoryFilter,
} from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import {
  LeaderboardScore,
  Badge,
  CompanyBadge,
  LeaderboardRanking,
  LeaderboardHistory,
} from '@/3-domain/entities/Leaderboard';
import { trackSupabaseQuery } from '@/5-shared/middleware/query-performance';

export class SupabaseLeaderboardRepository implements ILeaderboardRepository {
  private async getSupabaseClient() {
    // In test environment, use admin client to bypass RLS
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return getSupabaseAdminClient();
    }
    return await createClient();
  }

  // =====================================================
  // SCORES
  // =====================================================

  async addScore(params: AddScoreParams): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      // Use database function to add score and check badges
      const { error } = await supabase.rpc('add_leaderboard_score', {
        p_company_id: params.companyId,
        p_program_id: params.programId,
        p_activity_type: params.activityType,
        p_activity_id: params.activityId,
        p_points: params.points,
        p_multiplier: params.multiplier,
        p_metadata: params.metadata,
      });

      if (error) {
        return Result.fail(`Puan eklenemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Puan eklenemedi: ${error}`);
    }
  }

  async refreshRankings(): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.rpc('refresh_leaderboard');

      if (error) {
        return Result.fail(`Liderlik tablosu yenilenemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Liderlik tablosu yenilenemedi: ${error}`);
    }
  }

  async getRankings(filter?: LeaderboardFilter): Promise<Result<LeaderboardRanking[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      // Select all columns (leaderboard_rankings view already includes company_name)
      let query = supabase.from('leaderboard_rankings').select('*');

      if (filter?.programId) {
        query = query.eq('program_id', filter.programId);
      }

      if (filter?.companyId) {
        query = query.eq('company_id', filter.companyId);
      }

      // Order by rank
      query = query.order('rank', { ascending: true });

      // Apply pagination
      if (filter?.limit) {
        query = query.limit(filter.limit);
      }
      if (filter?.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
      }

      const result = await trackSupabaseQuery(
        'LeaderboardRepository.getRankings',
        async () => {
          const result = await query;
          return result;
        },
        {
          filters: {
            programId: filter?.programId,
            companyId: filter?.companyId,
            limit: filter?.limit,
            offset: filter?.offset,
          },
        }
      );
      const { data, error } = result;

      if (error) {
        return Result.fail(`Liderlik tablosu alınamadı: ${error.message}`);
      }

      return Result.ok(data.map(this.mapToRanking));
    } catch (error) {
      return Result.fail(`Liderlik tablosu alınamadı: ${error}`);
    }
  }

  async getCompanyRanking(
    companyId: string,
    programId: string
  ): Promise<Result<LeaderboardRanking | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      // Select all columns (leaderboard_rankings view already includes company_name)
      const { data, error } = await supabase
        .from('leaderboard_rankings')
        .select('*')
        .eq('company_id', companyId)
        .eq('program_id', programId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Firma sıralaması alınamadı: ${error.message}`);
      }

      return Result.ok(this.mapToRanking(data));
    } catch (error) {
      return Result.fail(`Firma sıralaması alınamadı: ${error}`);
    }
  }

  async getCompanyScores(companyId: string, limit?: number): Promise<Result<LeaderboardScore[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase
        .from('leaderboard_scores')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const result = await trackSupabaseQuery(
        'LeaderboardRepository.getRankings',
        async () => {
          const result = await query;
          return result;
        },
        {
          filters: {
            programId: filter?.programId,
            companyId: filter?.companyId,
            limit: filter?.limit,
            offset: filter?.offset,
          },
        }
      );
      const { data, error } = result;

      if (error) {
        return Result.fail(`Firma puanları alınamadı: ${error.message}`);
      }

      return Result.ok(data.map(this.mapToScore));
    } catch (error) {
      return Result.fail(`Firma puanları alınamadı: ${error}`);
    }
  }

  // =====================================================
  // BADGES
  // =====================================================

  async getBadges(filter?: BadgeFilter): Promise<Result<Badge[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('leaderboard_badges').select('*');

      if (filter?.category) {
        query = query.eq('category', filter.category);
      }

      if (filter?.isActive !== undefined) {
        query = query.eq('is_active', filter.isActive);
      }

      query = query.order('order_index', { ascending: true });

      const result = await trackSupabaseQuery(
        'LeaderboardRepository.getRankings',
        async () => {
          const result = await query;
          return result;
        },
        {
          filters: {
            programId: filter?.programId,
            companyId: filter?.companyId,
            limit: filter?.limit,
            offset: filter?.offset,
          },
        }
      );
      const { data, error } = result;

      if (error) {
        return Result.fail(`Rozetler alınamadı: ${error.message}`);
      }

      return Result.ok(data.map(this.mapToBadge));
    } catch (error) {
      return Result.fail(`Rozetler alınamadı: ${error}`);
    }
  }

  async getBadgeById(badgeId: string): Promise<Result<Badge | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('leaderboard_badges')
        .select('*')
        .eq('id', badgeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Rozet bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToBadge(data));
    } catch (error) {
      return Result.fail(`Rozet bulunamadı: ${error}`);
    }
  }

  async createBadge(badge: Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Badge>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('leaderboard_badges')
        .insert({
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          category: badge.category,
          requirement_type: badge.requirementType,
          requirement_value: badge.requirementValue,
          requirement_activity: badge.requirementActivity,
          points_bonus: badge.pointsBonus,
          is_active: badge.isActive,
          order_index: badge.orderIndex,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Rozet oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToBadge(data));
    } catch (error) {
      return Result.fail(`Rozet oluşturulamadı: ${error}`);
    }
  }

  async updateBadge(badgeId: string, updates: Partial<Badge>): Promise<Result<Badge>> {
    try {
      const supabase = await this.getSupabaseClient();

      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.icon !== undefined) updateData.icon = updates.icon;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.requirementType !== undefined)
        updateData.requirement_type = updates.requirementType;
      if (updates.requirementValue !== undefined)
        updateData.requirement_value = updates.requirementValue;
      if (updates.requirementActivity !== undefined)
        updateData.requirement_activity = updates.requirementActivity;
      if (updates.pointsBonus !== undefined) updateData.points_bonus = updates.pointsBonus;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.orderIndex !== undefined) updateData.order_index = updates.orderIndex;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('leaderboard_badges')
        .update(updateData)
        .eq('id', badgeId)
        .select()
        .single();

      if (error) {
        return Result.fail(`Rozet güncellenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToBadge(data));
    } catch (error) {
      return Result.fail(`Rozet güncellenemedi: ${error}`);
    }
  }

  async deleteBadge(badgeId: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.from('leaderboard_badges').delete().eq('id', badgeId);

      if (error) {
        return Result.fail(`Rozet silinemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Rozet silinemedi: ${error}`);
    }
  }

  async getCompanyBadges(companyId: string): Promise<Result<CompanyBadge[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('company_badges')
        .select('*')
        .eq('company_id', companyId)
        .order('earned_at', { ascending: false });

      if (error) {
        return Result.fail(`Firma rozetleri alınamadı: ${error.message}`);
      }

      return Result.ok(data.map(this.mapToCompanyBadge));
    } catch (error) {
      return Result.fail(`Firma rozetleri alınamadı: ${error}`);
    }
  }

  // =====================================================
  // HISTORY
  // =====================================================

  async getHistory(filter?: HistoryFilter): Promise<Result<LeaderboardHistory[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('leaderboard_history').select('*');

      if (filter?.companyId) {
        query = query.eq('company_id', filter.companyId);
      }

      if (filter?.programId) {
        query = query.eq('program_id', filter.programId);
      }

      if (filter?.startDate) {
        query = query.gte('snapshot_date', filter.startDate.toISOString().split('T')[0]);
      }

      if (filter?.endDate) {
        query = query.lte('snapshot_date', filter.endDate.toISOString().split('T')[0]);
      }

      query = query.order('snapshot_date', { ascending: false });

      const result = await trackSupabaseQuery(
        'LeaderboardRepository.getRankings',
        async () => {
          const result = await query;
          return result;
        },
        {
          filters: {
            programId: filter?.programId,
            companyId: filter?.companyId,
            limit: filter?.limit,
            offset: filter?.offset,
          },
        }
      );
      const { data, error } = result;

      if (error) {
        return Result.fail(`Geçmiş veriler alınamadı: ${error.message}`);
      }

      return Result.ok(data.map(this.mapToHistory));
    } catch (error) {
      return Result.fail(`Geçmiş veriler alınamadı: ${error}`);
    }
  }

  async createSnapshot(): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.rpc('create_leaderboard_snapshot');

      if (error) {
        return Result.fail(`Snapshot oluşturulamadı: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Snapshot oluşturulamadı: ${error}`);
    }
  }

  async getCompanyTrend(
    companyId: string,
    programId: string,
    weeks: number = 12
  ): Promise<Result<LeaderboardHistory[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - weeks * 7);

      const { data, error } = await supabase
        .from('leaderboard_history')
        .select('*')
        .eq('company_id', companyId)
        .eq('program_id', programId)
        .gte('snapshot_date', startDate.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: true });

      if (error) {
        return Result.fail(`Trend verileri alınamadı: ${error.message}`);
      }

      return Result.ok(data.map(this.mapToHistory));
    } catch (error) {
      return Result.fail(`Trend verileri alınamadı: ${error}`);
    }
  }

  // =====================================================
  // MAPPERS
  // =====================================================

  private mapToScore(data: any): LeaderboardScore {
    return {
      id: data.id,
      companyId: data.company_id,
      programId: data.program_id,
      activityType: data.activity_type,
      activityId: data.activity_id,
      points: data.points,
      multiplier: parseFloat(data.multiplier),
      finalPoints: data.final_points,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
    };
  }

  private mapToBadge(data: any): Badge {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      category: data.category,
      requirementType: data.requirement_type,
      requirementValue: data.requirement_value,
      requirementActivity: data.requirement_activity,
      pointsBonus: data.points_bonus,
      isActive: data.is_active,
      orderIndex: data.order_index,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToCompanyBadge(data: any): CompanyBadge {
    return {
      id: data.id,
      companyId: data.company_id,
      badgeId: data.badge_id,
      earnedAt: new Date(data.earned_at),
    };
  }

  private mapToRanking(data: any): LeaderboardRanking {
    // Handle both cases: direct company_name (from view) or companies.name (from JOIN)
    const companyName = data.company_name || data.companies?.name || '';

    return {
      companyId: data.company_id,
      companyName,
      programId: data.program_id,
      totalScore: data.total_score,
      projectScore: data.project_score,
      trainingScore: data.training_score,
      eventScore: data.event_score,
      forumScore: data.forum_score,
      newsScore: data.news_score,
      appointmentScore: data.appointment_score,
      rank: data.rank,
      badgeCount: data.badge_count,
      lastActivityAt: data.last_activity_at ? new Date(data.last_activity_at) : null,
    };
  }

  private mapToHistory(data: any): LeaderboardHistory {
    return {
      id: data.id,
      companyId: data.company_id,
      programId: data.program_id,
      snapshotDate: new Date(data.snapshot_date),
      totalScore: data.total_score,
      projectScore: data.project_score,
      trainingScore: data.training_score,
      eventScore: data.event_score,
      forumScore: data.forum_score,
      newsScore: data.news_score,
      appointmentScore: data.appointment_score,
      rank: data.rank,
      badgeCount: data.badge_count,
      createdAt: new Date(data.created_at),
    };
  }
}
