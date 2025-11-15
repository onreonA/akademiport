import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/database/supabase-server';
import { SupabaseNewsRepository } from '@/4-infrastructure/database/repositories/SupabaseNewsRepository';
import { RecordNewsReadUseCase } from '@/2-application/use-cases/news';
import { RecordReadDto } from '@/2-application/dtos/news';

/**
 * POST /api/news/[id]/read
 * Record news read (for leaderboard)
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

    // Get user's company
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!userData?.company_id) {
      return NextResponse.json({ error: 'Şirket bilgisi bulunamadı' }, { status: 400 });
    }

    const body = await request.json();
    const dto: RecordReadDto = {
      newsId: id,
      userId: user.id,
      companyId: userData.company_id,
      readDuration: body.readDuration,
      scrollPercentage: body.scrollPercentage,
    };

    const repository = new SupabaseNewsRepository();
    const useCase = new RecordNewsReadUseCase(repository);
    const result = await useCase.execute(dto);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('POST /api/news/[id]/read error:', error);
    return NextResponse.json({ error: 'Okuma kaydedilemedi' }, { status: 500 });
  }
}

