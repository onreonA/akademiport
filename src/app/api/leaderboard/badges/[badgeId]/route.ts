import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { UpdateBadgeUseCase, DeleteBadgeUseCase } from '@/2-application/use-cases/leaderboard';
import { UpdateBadgeDtoSchema } from '@/2-application/dtos/leaderboard';

/**
 * PATCH /api/leaderboard/badges/[badgeId]
 * Update badge (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ badgeId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Check if user is master_admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'master_admin') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();
    const dtoResult = UpdateBadgeDtoSchema.safeParse(body);

    if (!dtoResult.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: dtoResult.error.issues },
        { status: 400 }
      );
    }

    const { badgeId } = await params;
    const repository = new SupabaseLeaderboardRepository();
    const useCase = new UpdateBadgeUseCase(repository);
    const result = await useCase.execute(badgeId, dtoResult.data);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ badge: result.value });
  } catch (error) {
    console.error('PATCH /api/leaderboard/badges/[badgeId] error:', error);
    return NextResponse.json({ error: 'Rozet güncellenemedi' }, { status: 500 });
  }
}

/**
 * DELETE /api/leaderboard/badges/[badgeId]
 * Delete badge (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ badgeId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Check if user is master_admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'master_admin') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const { badgeId } = await params;
    const repository = new SupabaseLeaderboardRepository();
    const useCase = new DeleteBadgeUseCase(repository);
    const result = await useCase.execute(badgeId);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Rozet silindi' });
  } catch (error) {
    console.error('DELETE /api/leaderboard/badges/[badgeId] error:', error);
    return NextResponse.json({ error: 'Rozet silinemedi' }, { status: 500 });
  }
}
