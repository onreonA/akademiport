import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { MarkSolutionUseCase } from '@/2-application/use-cases/forum';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';

/**
 * POST /api/forum/topics/[id]/solution
 * Mark a reply as solution
 */
export async function POST(
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
    const body = await request.json();
    const { replyId } = body;

    if (!replyId) {
      return NextResponse.json({ error: 'Yanıt ID gereklidir' }, { status: 400 });
    }

    // Check if user is topic author or consultant/admin
    const repository = new SupabaseForumRepository();
    const topicResult = await repository.findTopicById(id);

    if (topicResult.isFailure || !topicResult.value) {
      return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 });
    }

    const topic = topicResult.value;
    const isAuthor = topic.authorId === user.id;

    if (!isAuthor) {
      // Check if user is consultant/admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const isConsultant = userData?.role === 'consultant' || userData?.role === 'master_admin';

      if (!isConsultant) {
        return NextResponse.json(
          { error: 'Sadece konu sahibi veya danışman çözüm işaretleyebilir' },
          { status: 403 }
        );
      }
    }

    const leaderboardRepository = new SupabaseLeaderboardRepository();
    const companyRepository = new CompanyRepository();
    const addLeaderboardScore = new AddLeaderboardScoreUseCase(leaderboardRepository, companyRepository);
    const useCase = new MarkSolutionUseCase(repository, addLeaderboardScore);
    const result = await useCase.execute(id, replyId, user.id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Çözüm işaretlendi' });
  } catch (error) {
    console.error('POST /api/forum/topics/[id]/solution error:', error);
    return NextResponse.json({ error: 'Çözüm işaretlenemedi' }, { status: 500 });
  }
}

