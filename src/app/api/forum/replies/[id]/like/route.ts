import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { LikeReplyUseCase, UnlikeReplyUseCase } from '@/2-application/use-cases/forum';

/**
 * POST /api/forum/replies/[id]/like
 * Like a reply
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
    const useCase = new LikeReplyUseCase(repository);
    const result = await useCase.execute(id, user.id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Beğeni eklendi' });
  } catch (error) {
    console.error('POST /api/forum/replies/[id]/like error:', error);
    return NextResponse.json({ error: 'Beğeni eklenemedi' }, { status: 500 });
  }
}

/**
 * DELETE /api/forum/replies/[id]/like
 * Unlike a reply
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
    const useCase = new UnlikeReplyUseCase(repository);
    const result = await useCase.execute(id, user.id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Beğeni kaldırıldı' });
  } catch (error) {
    console.error('DELETE /api/forum/replies/[id]/like error:', error);
    return NextResponse.json({ error: 'Beğeni kaldırılamadı' }, { status: 500 });
  }
}

