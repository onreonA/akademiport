import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET /api/projects/enhanced - Enhanced project listing with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    // Get user info
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get user role and company info
    const { data: userData } = await supabase
      .from('company_users')
      .select('role, company_id')
      .eq('email', user.email)
      .single();
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Build query based on role
    let query = supabase.from('projects').select(`
        *,
        companies!inner(name, city, industry),
        project_comments(count),
        project_files(count),
        project_milestones(count),
        tasks(count)
      `);
    // Apply role-based filtering
    if (userData.role === 'admin') {
      // Admin can see all projects
    } else {
      // Company users can only see their company's projects
      query = query.eq('company_id', userData.company_id);
    }
    // Apply filters
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const consultant_id = searchParams.get('consultant_id');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (consultant_id) query = query.eq('consultant_id', consultant_id);
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    // Get total count for pagination
    const { count } = await query.select('*', {
      count: 'exact',
      head: true,
    } as any);
    // Get paginated results
    const { data: projects, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// POST /api/projects/enhanced - Create new project
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get user role
    const { data: userData } = await supabase
      .from('company_users')
      .select('role, company_id')
      .eq('email', user.email)
      .single();
    if (!userData || !['admin'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const {
      name,
      description,
      company_id,
      priority = 'Orta',
      status = 'Planlandı',
      consultant_id,
      deadline,
      template_id,
    } = body;
    // Validate required fields
    if (!name || !company_id) {
      return NextResponse.json(
        { error: 'Name and company_id are required' },
        { status: 400 }
      );
    }
    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        company_id,
        priority,
        status,
        consultant_id,
        deadline,
        template_id,
        created_by: user.email,
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }
    // If template_id provided, create tasks from template
    if (template_id) {
      await createTasksFromTemplate(supabase, project.id, template_id);
    }
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// Helper function to create tasks from template
async function createTasksFromTemplate(
  supabase: any,
  projectId: string,
  templateId: string
) {
  try {
    // Get template tasks
    const { data: templateTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', templateId);
    if (templateTasks && templateTasks.length > 0) {
      // Create tasks for new project
      const newTasks = templateTasks.map((task: any) => ({
        ...task,
        id: undefined,
        project_id: projectId,
        status: 'pending',
        created_at: undefined,
        updated_at: undefined,
      }));
      await supabase.from('tasks').insert(newTasks);
    }
  } catch (error) {}
}
