import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// GET /api/firma/tasks - Get tasks assigned to the logged-in company
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get user info from cookies
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    const userCompanyId = request.cookies.get('auth-user-company-id')?.value;

    if (!userEmail || !userCompanyId) {
      return NextResponse.json(
        { error: 'Kullanıcı kimlik doğrulaması gerekli' },
        { status: 401 }
      );
    }

    // Only company users can access this endpoint
    if (!['firma_admin', 'firma_kullanıcı'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Erişim reddedildi' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const projectId = searchParams.get('project_id');
    const subProjectId = searchParams.get('sub_project_id');
    const limit = searchParams.get('limit');

    // Build query to get tasks assigned to the company
    // First, get all tasks and then filter by company through projects
    let query = supabase.from('tasks').select('*');

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (subProjectId) {
      query = query.eq('sub_project_id', subProjectId);
    }

    // Apply ordering and limit
    query = query.order('created_at', { ascending: false });
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: tasks, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Görevler alınırken hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    // Filter tasks by company through projects
    // Get projects for each task to filter by company
    const companyTasks = [];
    for (const task of tasks || []) {
      if (task.project_id) {
        const { data: project } = await supabase
          .from('projects')
          .select('company_id')
          .eq('id', task.project_id)
          .single();

        if (project && project.company_id === userCompanyId) {
          companyTasks.push(task);
        }
      }
    }

    // Format tasks for frontend
    const formattedTasks = companyTasks.map(task => ({
      id: task.id,
      name: task.title, // tasks table uses 'title' not 'name'
      description: task.description,
      status: task.status,
      priority: task.priority,
      progress: 0, // Default progress since we removed it from select
      estimatedHours: null, // Not in current schema
      actualHours: null, // Not in current schema
      startDate: task.start_date,
      endDate: task.end_date,
      deadline: task.due_date, // tasks table uses 'due_date' not 'deadline'
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      completedAt: null, // Not in current schema
      completedBy: null, // Not in current schema
      completionNote: null, // Not in current schema
      consultantApprovalStatus: null, // Not in current schema
      approvedAt: null, // Not in current schema
      approvedBy: null, // Not in current schema
      approvalNote: null, // Not in current schema
      qualityScore: null, // Not in current schema
      projectId: task.project_id,
      subProjectId: task.sub_project_id,
      assignedAt: null, // Not in current schema
      assignedBy: null, // Not in current schema
      assignedTo: task.assigned_to,
      project: null, // Will be fetched separately if needed
      subProject: null, // Will be fetched separately if needed
    }));

    return NextResponse.json({
      success: true,
      tasks: formattedTasks,
      total: formattedTasks.length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
