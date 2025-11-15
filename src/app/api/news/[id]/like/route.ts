import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/database/supabase-server';
import { SupabaseNewsRepository } from '@/4-infrastructure/database/repositories/SupabaseNewsRepository';

/**
 * POST /api/news/[id]/like
 * Like news
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

    const repository = new SupabaseNewsRepository();
    const result = await repository.likeNews(id, user.id, userData?.company_id || null);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('POST /api/news/[id]/like error:', error);
    return NextResponse.json({ error: 'Beğeni eklenemedi' }, { status: 500 });
  }
}

/**
 * DELETE /api/news/[id]/like
 * Unlike news
 */
export async function DELETE(
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

    const repository = new SupabaseNewsRepository();
    const result = await repository.unlikeNews(id, user.id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Beğeni kaldırıldı' });
  } catch (error) {
    console.error('DELETE /api/news/[id]/like error:', error);
    return NextResponse.json({ error: 'Beğeni kaldırılamadı' }, { status: 500 });
  }
}

