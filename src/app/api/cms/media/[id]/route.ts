/**
 * API Route: CMS Media by ID
 * Sprint 23: CMS
 *
 * DELETE /api/cms/media/[id] - Delete media
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseCMSMediaRepository } from '@/4-infrastructure/database/repositories/SupabaseCMSMediaRepository';

/**
 * DELETE /api/cms/media/[id]
 * Delete media
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

    // Check if user is master_admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'master_admin') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const repository = new SupabaseCMSMediaRepository();
    const result = await repository.delete(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Medya silindi',
    });
  } catch (error) {
    console.error('DELETE /api/cms/media/[id] error:', error);
    return NextResponse.json({ error: 'Medya silinemedi' }, { status: 500 });
  }
}
