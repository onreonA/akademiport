import { NextRequest, NextResponse } from 'next/server';

import { cacheKeys, cacheUtils } from '@/lib/cache/redis-cache';
import { createClient } from '@/lib/supabase/server';
import { requireCompany, createAuthErrorResponse } from '@/lib/jwt-utils';
// GET /api/firma/dashboard-stats - Get firm's dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // JWT Authentication - Company users only
    const user = await requireCompany(request);
    
    const supabase = createClient();
    // OPTIMIZED: Check cache first
    const cacheKey = cacheKeys.firmaStats(user.email);
    const cachedData = cacheUtils.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Use company_id from JWT token
    const companyId = user.company_id;
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID not found in token' },
        { status: 400 }
      );
    }
    
    // Get company basic info
    const { data: companyData, error: companyDataError } = await supabase
      .from('companies')
      .select('id, name, email')
      .eq('id', companyId)
      .single();

    if (companyDataError) {
      return NextResponse.json(
        { error: 'Failed to fetch company data' },
        { status: 500 }
      );
    }

    // Get projects separately
    const { data: projects } = await supabase
      .from('projects')
      .select('id, status, progress_percentage, created_at, updated_at')
      .eq('company_id', companyId);

    // Get education assignments separately
    const { data: educationAssignments } = await supabase
      .from('company_education_assignments')
      .select('id, status, created_at, updated_at')
      .eq('company_id', companyId);

    // Get tasks separately
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, status, created_at, updated_at')
      .eq('company_id', companyId);

    // Combine the data
    const combinedData = {
      ...companyData,
      projects: projects || [],
      company_education_assignments: educationAssignments || [],
      tasks: tasks || [],
    };
    // OPTIMIZED: Calculate all stats in single pass
    let totalProjects = 0;
    let activeProjects = 0;
    let completedProjects = 0;
    let totalProgress = 0;
    let totalEducation = 0;
    let completedEducation = 0;
    const pendingAppointments = 0;
    const confirmedAppointments = 0;
    const pendingDocuments = 0;
    const approvedDocuments = 0;
    let activeTasks = 0;
    let completedTasks = 0;

    // Process projects
    if (combinedData.projects) {
      combinedData.projects.forEach(project => {
        totalProjects++;
        if (project.status === 'Aktif') activeProjects++;
        if (project.status === 'Tamamlandı') completedProjects++;
        totalProgress += project.progress_percentage || 0;
      });
    }

    // Process education assignments
    if (combinedData.company_education_assignments) {
      combinedData.company_education_assignments.forEach(assignment => {
        totalEducation++;
        if (assignment.status === 'completed') completedEducation++;
      });
    }

    // Process appointments - removed as appointments table doesn't have company_id
    // Process documents - removed as documents table doesn't have company_id

    // Process tasks
    if (combinedData.tasks) {
      combinedData.tasks.forEach(task => {
        if (task.status === 'Aktif') activeTasks++;
        if (task.status === 'Tamamlandı') completedTasks++;
      });
    }
    // Calculate derived metrics
    const overallProgress =
      totalProjects > 0 ? Math.round(totalProgress / totalProjects) : 0;
    const educationProgress =
      totalEducation > 0
        ? Math.round((completedEducation / totalEducation) * 100)
        : 0;
    const stats = {
      company: {
        id: combinedData.id,
        name: combinedData.name,
        email: combinedData.email,
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        overallProgress,
      },
      education: {
        total: totalEducation,
        completed: completedEducation,
        progress: educationProgress,
      },
      appointments: {
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        total: 0,
      },
      documents: {
        pending: pendingDocuments,
        approved: approvedDocuments,
        total: 0,
      },
      tasks: {
        active: activeTasks,
        completed: completedTasks,
        total: 0,
      },
    };
    const response = {
      success: true,
      data: stats,
    };
    // Cache the response
    cacheUtils.set(cacheKey, response, 3 * 60 * 1000); // 3 minutes cache
    return NextResponse.json(response);
  } catch (error: any) {
    // Handle authentication errors specifically
    if (error.message === 'Authentication required' || 
        error.message === 'Company access required') {
      return createAuthErrorResponse(error.message, 401);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
