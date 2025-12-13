import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { LikeTopicUseCase, UnlikeTopicUseCase } from '@/2-application/use-cases/forum';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';

/**
 * POST /api/forum/topics/[id]/like
 * Like a topic
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Get user's company
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    const { id } = await params;

    const repository = new SupabaseForumRepository();
    const leaderboardRepository = new SupabaseLeaderboardRepository();
    const companyRepository = new CompanyRepository();
    const addLeaderboardScore = new AddLeaderboardScoreUseCase(
      leaderboardRepository,
      companyRepository
    );
    const useCase = new LikeTopicUseCase(repository, addLeaderboardScore);
    const result = await useCase.execute(id, user.id, userData?.company_id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Konu beğenildi' });
  } catch (error) {
    console.error('POST /api/forum/topics/[id]/like error:', error);
    return NextResponse.json({ error: 'Konu beğenilemedi' }, { status: 500 });
  }
}

/**
 * DELETE /api/forum/topics/[id]/like
 * Unlike a topic
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;

    const repository = new SupabaseForumRepository();
    const useCase = new UnlikeTopicUseCase(repository);
    const result = await useCase.execute(id, user.id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Beğeni kaldırıldı' });
  } catch (error) {
    console.error('DELETE /api/forum/topics/[id]/like error:', error);
    return NextResponse.json({ error: 'Beğeni kaldırılamadı' }, { status: 500 });
  }
}
