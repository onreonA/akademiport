import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { CloseTopicUseCase } from '@/2-application/use-cases/forum';

/**
 * POST /api/forum/topics/[id]/close
 * Close a topic
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

    // Check if user is topic author or admin/consultant
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
        return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
      }
    }

    const useCase = new CloseTopicUseCase(repository);
    const result = await useCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Konu kapatıldı' });
  } catch (error) {
    console.error('POST /api/forum/topics/[id]/close error:', error);
    return NextResponse.json({ error: 'Konu kapatılamadı' }, { status: 500 });
  }
}

