/**
 * API Route: Company Dashboard Stats
 * Sprint 27: Dashboard & Analytics
 *
 * GET /api/company-dashboard/stats - Get company dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { ProjectRepository } from '@/4-infrastructure/database/repositories/ProjectRepository';
import { TrainingRepository } from '@/4-infrastructure/database/repositories/TrainingRepository';
import { CompanyTrainingRepository } from '@/4-infrastructure/database/repositories/CompanyTrainingRepository';
import { EventRepository } from '@/4-infrastructure/database/repositories/EventRepository';
import { SupabaseEcommerceRepository } from '@/4-infrastructure/database/repositories/SupabaseEcommerceRepository';
import { GetCompanyDashboardStatsUseCase } from '@/2-application/use-cases/analytics/GetCompanyDashboardStatsUseCase';

/**
 * GET /api/company-dashboard/stats
 * Get company dashboard statistics
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

    // Check authorization (only company users and master_admin can access)
    const { data: userData } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Get companyId from query params or user's company_id
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId') || userData.company_id;

    if (!companyId) {
      return NextResponse.json({ error: 'Firma ID gerekli' }, { status: 400 });
    }

    // Check if user has access to this company
    if (userData.role !== 'master_admin' && userData.company_id !== companyId) {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    // Initialize repositories
    const projectRepository = new ProjectRepository();
    const trainingRepository = new TrainingRepository();
    const companyTrainingRepository = new CompanyTrainingRepository();
    const eventRepository = new EventRepository();
    const ecommerceRepository = new SupabaseEcommerceRepository();

    // Create use case
    const useCase = new GetCompanyDashboardStatsUseCase(
      projectRepository,
      trainingRepository,
      companyTrainingRepository,
      eventRepository,
      ecommerceRepository
    );

    // Execute
    const result = await useCase.execute(companyId);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.value });
  } catch (error) {
    console.error('GET /api/company-dashboard/stats error:', error);
    return NextResponse.json(
      { error: 'Company dashboard istatistikleri alınamadı' },
      { status: 500 }
    );
  }
}
