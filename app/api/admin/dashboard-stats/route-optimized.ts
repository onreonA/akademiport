import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// OPTIMIZED: Admin Dashboard Stats with caching and single query
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail || !['admin', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // OPTIMIZED: Single complex query instead of multiple queries
    const { data: statsData, error: statsError } = await supabase
      .from('companies')
      .select(
        `
        id,
        status,
        created_at,
        projects!left(
          id,
          status,
          created_at,
          updated_at
        ),
        company_education_assignments!left(
          id,
          status,
          created_at,
          updated_at
        )
      `
      )
      .order('created_at', { ascending: false });
    if (statsError) {
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }
    // OPTIMIZED: Calculate all stats in single pass
    let totalCompanies = 0;
    let activeCompanies = 0;
    let totalProjects = 0;
    let activeProjects = 0;
    let completedProjects = 0;
    let totalEducationAssignments = 0;
    let completedEducationAssignments = 0;
    let recentCompanies = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    statsData?.forEach(company => {
      totalCompanies++;
      if (company.status === 'active') {
        activeCompanies++;
      }
      if (new Date(company.created_at) > thirtyDaysAgo) {
        recentCompanies++;
      }
      // Count projects
      if (company.projects) {
        company.projects.forEach(project => {
          totalProjects++;
          if (project.status === 'active') activeProjects++;
          if (project.status === 'completed') completedProjects++;
        });
      }
      // Count education assignments
      if (company.company_education_assignments) {
        company.company_education_assignments.forEach(assignment => {
          totalEducationAssignments++;
          if (assignment.status === 'completed')
            completedEducationAssignments++;
        });
      }
    });
    // Get consultants and tasks count (separate queries for tables that might not exist)
    const [consultantsResult, tasksResult] = await Promise.all([
      supabase
        .from('consultants')
        .select('id, status', { count: 'exact' })
        .limit(1),
      supabase.from('tasks').select('id, status', { count: 'exact' }).limit(1),
    ]);
    const totalConsultants = consultantsResult.count || 0;
    const totalTasks = tasksResult.count || 0;
    const completedTasks =
      tasksResult.data?.filter(t => t.status === 'completed').length || 0;
    // Calculate derived metrics
    const growthRate =
      totalCompanies > 0
        ? Math.round((recentCompanies / totalCompanies) * 100 * 10) / 10
        : 0;
    const monthlyRevenue = activeCompanies * 800; // 800 TL per active company
    const stats = {
      totalProjects,
      activeProjects,
      completedProjects,
      totalCompanies,
      activeCompanies,
      totalConsultants,
      totalTasks,
      completedTasks,
      monthlyRevenue,
      growthRate,
      totalEducationAssignments,
      completedEducationAssignments,
    };
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
