import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { ReplyTopicUseCase } from '@/2-application/use-cases/forum';
import { CreateReplyDto } from '@/2-application/dtos/forum';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';

/**
 * GET /api/forum/topics/[id]/replies
 * List replies for a topic
 */
export async function GET(
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
    const searchParams = request.nextUrl.searchParams;

    const repository = new SupabaseForumRepository();
    const result = await repository.findAllReplies({
      topicId: id,
      parentId: searchParams.get('parentId') || undefined,
      authorId: searchParams.get('authorId') || undefined,
      isApproved: searchParams.get('isApproved') === 'true' ? true : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    });

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('GET /api/forum/topics/[id]/replies error:', error);
    return NextResponse.json({ error: 'Yanıtlar listelenemedi' }, { status: 500 });
  }
}

/**
 * POST /api/forum/topics/[id]/replies
 * Create reply for a topic
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

    // Get user's company
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!userData || !userData.company_id) {
      return NextResponse.json({ error: 'Firma bilgisi bulunamadı' }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();

    const dto: CreateReplyDto = {
      topicId: id,
      content: body.content,
      parentId: body.parentId || null,
    };

    const repository = new SupabaseForumRepository();
    const leaderboardRepository = new SupabaseLeaderboardRepository();
    const companyRepository = new CompanyRepository();
    const addLeaderboardScore = new AddLeaderboardScoreUseCase(leaderboardRepository, companyRepository);
    const useCase = new ReplyTopicUseCase(repository, addLeaderboardScore);
    const result = await useCase.execute(dto, user.id, userData.company_id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    console.error('POST /api/forum/topics/[id]/replies error:', error);
    return NextResponse.json({ error: 'Yanıt oluşturulamadı' }, { status: 500 });
  }
}

