/**
 * API Route: Consultant Dashboard Stats
 * Sprint 27: Dashboard & Analytics
 *
 * GET /api/consultant-dashboard/stats - Get consultant dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { UserRepository } from '@/4-infrastructure/database/repositories/UserRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { ProjectRepository } from '@/4-infrastructure/database/repositories/ProjectRepository';
import { TrainingRepository } from '@/4-infrastructure/database/repositories/TrainingRepository';
import { CompanyTrainingRepository } from '@/4-infrastructure/database/repositories/CompanyTrainingRepository';
import { EventRepository } from '@/4-infrastructure/database/repositories/EventRepository';
import { GetConsultantDashboardStatsUseCase } from '@/2-application/use-cases/analytics/GetConsultantDashboardStatsUseCase';

/**
 * GET /api/consultant-dashboard/stats
 * Get consultant dashboard statistics
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

    // Check authorization (only consultant and master_admin can access)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'consultant' && userData?.role !== 'master_admin') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    // Initialize repositories
    const userRepository = new UserRepository();
    const companyRepository = new CompanyRepository();
    const projectRepository = new ProjectRepository();
    const trainingRepository = new TrainingRepository();
    const companyTrainingRepository = new CompanyTrainingRepository();
    const eventRepository = new EventRepository();

    // Create use case
    const useCase = new GetConsultantDashboardStatsUseCase(
      userRepository,
      companyRepository,
      projectRepository,
      trainingRepository,
      companyTrainingRepository,
      eventRepository
    );

    // Execute
    const result = await useCase.execute(user.id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.value });
  } catch (error) {
    console.error('GET /api/consultant-dashboard/stats error:', error);
    return NextResponse.json(
      { error: 'Consultant dashboard istatistikleri alınamadı' },
      { status: 500 }
    );
  }
}
