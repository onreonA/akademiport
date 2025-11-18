/**
 * API Route: CMS Settings
 * Sprint 23: CMS
 *
 * GET /api/cms/settings - Get all settings
 * PUT /api/cms/settings - Update multiple settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseCMSSettingsRepository } from '@/4-infrastructure/database/repositories/SupabaseCMSSettingsRepository';
import { GetSettingsUseCase, UpdateSettingsUseCase } from '@/2-application/use-cases/cms';
import { CMSSettingsCategory } from '@/3-domain/entities/CMSSettings';

/**
 * GET /api/cms/settings
 * Get all settings or by category
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Public can read settings (for public website)
    // But master_admin can see all, including draft settings

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as CMSSettingsCategory | null;

    const repository = new SupabaseCMSSettingsRepository();
    const useCase = new GetSettingsUseCase(repository);

    let result;
    if (category) {
      result = await useCase.executeByCategory(category);
    } else {
      result = await useCase.executeAll();
    }

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch (error) {
    console.error('GET /api/cms/settings error:', error);
    return NextResponse.json({ error: 'Ayarlar alınamadı' }, { status: 500 });
  }
}

/**
 * PUT /api/cms/settings
 * Update multiple settings
 */
export async function PUT(request: NextRequest) {
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
    const settings: Record<string, any> = body.settings || body;

    const repository = new SupabaseCMSSettingsRepository();
    const useCase = new UpdateSettingsUseCase(repository);
    const result = await useCase.executeMany(settings, user.id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch (error) {
    console.error('PUT /api/cms/settings error:', error);
    return NextResponse.json({ error: 'Ayarlar güncellenemedi' }, { status: 500 });
  }
}
