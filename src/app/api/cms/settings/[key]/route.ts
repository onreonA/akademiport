/**
 * API Route: CMS Setting by Key
 * Sprint 23: CMS
 *
 * GET /api/cms/settings/[key] - Get setting by key
 * PUT /api/cms/settings/[key] - Update setting by key
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseCMSSettingsRepository } from '@/4-infrastructure/database/repositories/SupabaseCMSSettingsRepository';
import { GetSettingsUseCase, UpdateSettingsUseCase } from '@/2-application/use-cases/cms';
import { UpdateCMSSettingsDto } from '@/3-domain/entities/CMSSettings';

/**
 * GET /api/cms/settings/[key]
 * Get setting by key
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;

    // Public can read settings
    const repository = new SupabaseCMSSettingsRepository();
    const useCase = new GetSettingsUseCase(repository);
    const result = await useCase.executeByKey(key);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (!result.value) {
      return NextResponse.json({ error: 'Ayar bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch (error) {
    console.error('GET /api/cms/settings/[key] error:', error);
    return NextResponse.json({ error: 'Ayar getirilemedi' }, { status: 500 });
  }
}

/**
 * PUT /api/cms/settings/[key]
 * Update setting by key
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
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
    const dto: UpdateCMSSettingsDto = {
      value: body.value,
      category: body.category,
      description: body.description,
    };

    const repository = new SupabaseCMSSettingsRepository();
    const useCase = new UpdateSettingsUseCase(repository);
    const result = await useCase.execute(key, dto, user.id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch (error) {
    console.error('PUT /api/cms/settings/[key] error:', error);
    return NextResponse.json({ error: 'Ayar güncellenemedi' }, { status: 500 });
  }
}
