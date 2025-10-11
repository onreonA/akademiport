import { NextRequest, NextResponse } from 'next/server';

import { createAuthErrorResponse, requireAuth } from '@/lib/jwt-utils';
import { ROLE_GROUPS } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/server';
// GET /api/projects/[id] - Get single project with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // JWT Authentication
    const user = await requireAuth(request);

    const { id } = await params;
    const supabase = createClient();

    // Get project with basic data first
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Proje bulunamadı', details: error.message },
        { status: 404 }
      );
    }
    // Check permissions - Admin users can access all projects, company users only their own
    const isAdmin = ROLE_GROUPS.ADMIN_ROLES.includes(user.role);

    if (!isAdmin) {
      // For company users, check if they have access to this project
      const userCompanyId = user.company_id;

      // Check both direct assignment and multi-company assignment
      const isDirectlyAssigned = project.company_id === userCompanyId;
      if (!isDirectlyAssigned) {
        // Check multi-company assignment
        const { data: assignment } = await supabase
          .from('project_company_assignments')
          .select('id')
          .eq('project_id', id)
          .eq('company_id', userCompanyId)
          .single();
        if (!assignment) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      }
    }
    // Get sub-projects for this project
    const { data: subProjects, error: subProjectsError } = await supabase
      .from('sub_projects')
      .select(
        `
        id,
        name,
        description,
        status,
        start_date,
        end_date,
        progress,
        created_at,
        updated_at
      `
      )
      .eq('project_id', id)
      .order('created_at', { ascending: true });

    if (subProjectsError) {
      return NextResponse.json(
        {
          error: 'Failed to fetch sub-projects',
          details: subProjectsError.message,
        },
        { status: 500 }
      );
    }

    // Get tasks for sub-projects
    let allTasks = [];
    if (subProjects && subProjects.length > 0) {
      const subProjectIds = subProjects.map(sp => sp.id);
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(
          `
          id,
          title,
          description,
          status,
          priority,
          due_date,
          created_at,
          updated_at,
          sub_project_id
        `
        )
        .in('sub_project_id', subProjectIds)
        .order('created_at', { ascending: true });

      if (tasksError) {
        return NextResponse.json(
          { error: 'Failed to fetch tasks', details: tasksError.message },
          { status: 500 }
        );
      }

      allTasks = tasks || [];
    }

    // Get sub-project company assignments
    const { data: subProjectAssignments, error: subProjectAssignmentsError } =
      await supabase
        .from('sub_project_company_assignments')
        .select('sub_project_id, company_id, status')
        .eq('status', 'active');

    // Attach tasks to their respective sub-projects with company counts
    const subProjectsWithTasks = (subProjects || []).map(subProject => {
      const subProjectTasks = allTasks.filter(
        task => task.sub_project_id === subProject.id
      );
      const assignedCompanies =
        subProjectAssignments?.filter(
          assignment => assignment.sub_project_id === subProject.id
        ) || [];

      return {
        ...subProject,
        tasks: subProjectTasks,
        taskCount: subProjectTasks.length,
        assignedCompanyCount: assignedCompanies.length,
      };
    });

    // Get assigned companies for this project
    const { data: assignedCompanies, error: companiesError } = await supabase
      .from('project_company_assignments')
      .select(
        `
        id,
        status,
        assigned_at,
        companies!inner(
          id,
          name,
          email
        )
      `
      )
      .eq('project_id', id)
      .eq('status', 'active');

    if (companiesError) {
      return NextResponse.json(
        {
          error: 'Failed to fetch assigned companies',
          details: companiesError.message,
        },
        { status: 500 }
      );
    }

    // Format project data for frontend
    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status || 'Planlandı',
      progress: project.progress || 0,
      start_date: project.start_date,
      end_date: project.end_date,
      deadline: project.end_date, // Frontend expects deadline
      created_at: project.created_at,
      updated_at: project.updated_at,
      company_id: project.company_id,
      consultant_id: project.consultant_id,
      companies: project.companies,
      // Populate with real data
      project_comments: [],
      project_files: [],
      project_milestones: [],
      tasks: allTasks,
      sub_projects: subProjectsWithTasks,
      assignedCompanies: assignedCompanies || [],
    };
    return NextResponse.json({ project: formattedProject });
  } catch (error: any) {
    // Handle authentication errors specifically
    if (error.message === 'Authentication required') {
      return createAuthErrorResponse(error.message, 401);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// PATCH /api/projects/[id] - Update project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // JWT Authentication - Only admin users can update projects
    const user = await requireAuth(request);

    const { id } = await params;
    const supabase = createClient();

    // Only admin and consultant can update projects
    if (!ROLE_GROUPS.ADMIN_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    const body = await request.json(); // Debug
    // Check if project exists
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .single();
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    // Map frontend data to database columns
    const updateData = {
      name: body.name,
      description: body.description,
      status:
        body.status === 'Planlandı'
          ? 'Planlandı' // Database uses Turkish enum values
          : body.status === 'Aktif'
            ? 'Aktif'
            : body.status === 'Tamamlandı'
              ? 'Tamamlandı'
              : 'Planlandı', // Default to 'Planlandı' (Turkish)
      start_date: body.start_date || body.startDate,
      end_date: body.end_date || body.endDate,
      company_id: body.company_id,
      admin_note: body.adminNote, // Map adminNote to admin_note
      updated_at: new Date().toISOString(),
    }; // Debug
    // Update project
    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    } // Debug
    return NextResponse.json({ project: updatedProject });
  } catch (error: any) {
    // Handle authentication errors specifically
    if (error.message === 'Authentication required') {
      return createAuthErrorResponse(error.message, 401);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// PUT /api/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // JWT Authentication - Only admin users can update projects
    const user = await requireAuth(request);

    // Only admin and consultant can update projects
    if (!ROLE_GROUPS.ADMIN_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    const { id } = await params;
    const supabase = createClient();

    const body = await request.json();
    const {
      name,
      description,
      priority,
      status,
      consultant_id,
      deadline,
      progress_percentage,
    } = body;
    // Check if project exists
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .single();
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    // Update project
    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update({
        name,
        description,
        priority,
        status,
        consultant_id,
        deadline,
        progress_percentage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }
    return NextResponse.json({ project: updatedProject });
  } catch (error: any) {
    // Handle authentication errors specifically
    if (error.message === 'Authentication required') {
      return createAuthErrorResponse(error.message, 401);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // JWT Authentication - Only admin users can delete projects
    const user = await requireAuth(request);

    // Only admin and master_admin can delete projects
    if (!['admin', 'master_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createClient();

    // Check if project exists
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 🛡️ SILME KISITLAMASI: Firma atamaları ve işlem takibi kontrolü
    const [assignmentsResult, subProjectsWithActivityResult] =
      await Promise.all([
        // Ana proje firma atamaları kontrolü
        supabase
          .from('project_company_assignments')
          .select('id, company_id, status')
          .eq('project_id', id)
          .eq('status', 'active'),

        // Alt projelerde firma aktivitesi kontrolü
        supabase
          .from('sub_projects')
          .select(
            `
          id,
          sub_project_company_assignments!inner(id, status),
          tasks(
            id,
            task_company_assignments(id, status),
            task_completions(id),
            task_comments(id),
            task_files(id)
          )
        `
          )
          .eq('project_id', id),
      ]);

    // Aktif firma atamaları varsa silme işlemini engelle
    if (assignmentsResult.data && assignmentsResult.data.length > 0) {
      const activeAssignments = assignmentsResult.data.filter(
        a => a.status === 'active'
      );
      if (activeAssignments.length > 0) {
        return NextResponse.json(
          {
            error:
              'Bu proje aktif firma atamalarına sahip olduğu için silinemez. Önce tüm firma atamalarını kaldırın.',
            details: {
              activeAssignments: activeAssignments.length,
              companies: activeAssignments.map(a => a.company_id),
            },
          },
          { status: 400 }
        );
      }
    }

    // Alt projelerde firma aktivitesi varsa silme işlemini engelle
    if (
      subProjectsWithActivityResult.data &&
      subProjectsWithActivityResult.data.length > 0
    ) {
      const subProjectsWithActivity = subProjectsWithActivityResult.data.filter(
        subProject => {
          // Alt proje seviyesinde aktivite kontrolü
          const hasSubProjectActivity =
            subProject.sub_project_company_assignments &&
            subProject.sub_project_company_assignments.length > 0;

          // Görev seviyesinde aktivite kontrolü
          const hasTaskActivity =
            subProject.tasks &&
            subProject.tasks.some(
              task =>
                (task.task_company_assignments &&
                  task.task_company_assignments.length > 0) ||
                (task.task_completions && task.task_completions.length > 0) ||
                (task.task_comments && task.task_comments.length > 0) ||
                (task.task_files && task.task_files.length > 0)
            );

          return hasSubProjectActivity || hasTaskActivity;
        }
      );

      if (subProjectsWithActivity.length > 0) {
        return NextResponse.json(
          {
            error:
              'Bu proje alt projelerinde veya görevlerinde firma aktiviteleri bulunduğu için silinemez. Firma atamaları, görev tamamlama, yorum veya dosya yükleme işlemleri mevcut.',
            details: {
              subProjectsWithActivity: subProjectsWithActivity.length,
              totalSubProjects: subProjectsWithActivityResult.data.length,
            },
          },
          { status: 400 }
        );
      }
    }

    // Delete project (cascade will handle related records)
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    // Handle authentication errors specifically
    if (error.message === 'Authentication required') {
      return createAuthErrorResponse(error.message, 401);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
