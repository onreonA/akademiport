import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { createClient } from '@/infrastructure/database/supabase-server';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';

const companyRepository = new CompanyRepository();
const projectRepository = new ProjectRepository();

/**
 * GET /api/company-dashboard
 * Get company dashboard data for authenticated company user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only company users can access this endpoint
    if (!user.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();

    // 1. Get company details
    const companyResult = await companyRepository.findById(user.companyId);
    if (companyResult.isFailure || !companyResult.value) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    const company = companyResult.value;

    // 2. Get program name if exists
    let programName = 'N/A';
    if (company.programId) {
      const { data: program } = await supabase
        .from('programs')
        .select('name')
        .eq('id', company.programId)
        .single();
      if (program) {
        programName = program.name;
      }
    }

    // 3. Get projects statistics
    const projectsData = await projectRepository.findAll({
      companyId: user.companyId,
    });

    let totalProjects = 0;
    let completedProjects = 0;
    let activeProjects = 0;

    if (projectsData && projectsData.data) {
      const projects = projectsData.data;

      totalProjects = projects.length;
      completedProjects = projects.filter((p: any) => p.status === 'completed').length;
      activeProjects = projects.filter(
        (p: any) => p.status === 'in_progress' || p.status === 'planning'
      ).length;
    }

    // 4. Get users count
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('company_id', user.companyId);

    const totalUsers = users?.length || 0;

    // 5. Calculate completion rate
    const completionRate =
      totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

    // 6. Training stats (placeholder for Sprint 9)
    const totalTrainings = 0;
    const completedTrainings = 0;

    return NextResponse.json({
      success: true,
      data: {
        company: {
          id: company.id,
          name: company.name,
          legalName: company.legalName || company.name,
          programName: programName,
        },
        stats: {
          totalProjects,
          completedProjects,
          activeProjects,
          totalTrainings,
          completedTrainings,
          totalUsers,
          completionRate,
        },
      },
    });
  } catch (error) {
    console.error('Company dashboard error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Dashboard verileri alınamadı' },
      { status: 500 }
    );
  }
}
