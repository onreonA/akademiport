import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/database/supabase-server';
import { SupabaseNewsRepository } from '@/4-infrastructure/database/repositories/SupabaseNewsRepository';
import { PublishNewsUseCase } from '@/2-application/use-cases/news';

/**
 * POST /api/news/[id]/publish
 * Publish news
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Check if user is admin or consultant
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['master_admin', 'consultant'].includes(userData.role)) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const repository = new SupabaseNewsRepository();
    const useCase = new PublishNewsUseCase(repository);
    const result = await useCase.execute(id, user.id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('POST /api/news/[id]/publish error:', error);
    return NextResponse.json({ error: 'Haber yayınlanamadı' }, { status: 500 });
  }
}

