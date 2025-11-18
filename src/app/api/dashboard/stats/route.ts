/**
 * API Route: Dashboard Stats
 * Sprint 27: Dashboard & Analytics
 *
 * GET /api/dashboard/stats - Get dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { UserRepository } from '@/4-infrastructure/database/repositories/UserRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { ProgramRepository } from '@/4-infrastructure/database/repositories/ProgramRepository';
import { ProjectRepository } from '@/4-infrastructure/database/repositories/ProjectRepository';
import { TaskRepository } from '@/4-infrastructure/database/repositories/TaskRepository';
import { GetDashboardStatsUseCase } from '@/2-application/use-cases/analytics/GetDashboardStatsUseCase';

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for Master Admin
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

    // Check authorization (only master_admin can access)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'master_admin') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    // Initialize repositories
    const userRepository = new UserRepository();
    const companyRepository = new CompanyRepository();
    const programRepository = new ProgramRepository();
    const projectRepository = new ProjectRepository();
    const taskRepository = new TaskRepository();

    // Create use case
    const useCase = new GetDashboardStatsUseCase(
      userRepository,
      companyRepository,
      programRepository,
      projectRepository,
      taskRepository
    );

    // Execute
    const result = await useCase.execute();

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.value });
  } catch (error) {
    console.error('GET /api/dashboard/stats error:', error);
    return NextResponse.json({ error: 'Dashboard istatistikleri alınamadı' }, { status: 500 });
  }
}
