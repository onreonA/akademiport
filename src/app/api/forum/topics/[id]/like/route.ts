import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { LikeTopicUseCase, UnlikeTopicUseCase } from '@/2-application/use-cases/forum';

/**
 * POST /api/forum/topics/[id]/like
 * Like a topic
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

    const repository = new SupabaseForumRepository();
    const useCase = new LikeTopicUseCase(repository);
    const result = await useCase.execute(id, user.id);

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

