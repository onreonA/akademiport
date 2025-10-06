import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET /api/projects/templates - Get project templates
export async function GET(request: NextRequest) {
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
      .select('role')
      .eq('email', user.email)
      .single();
    if (!userData || !['admin'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    // Get templates with task count
    const { data: templates, error } = await supabase
      .from('project_templates')
      .select(
        `
        *,
        created_by_user:users(email, full_name)
      `
      )
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }
    return NextResponse.json({ templates });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// POST /api/projects/templates - Create project template
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
      .select('role')
      .eq('email', user.email)
      .single();
    if (!userData || !['admin'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { name, description, tasks } = body;
    if (!name) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }
    // Create template
    const { data: template, error } = await supabase
      .from('project_templates')
      .insert({
        name,
        description,
        created_by: user.email,
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      );
    }
    // If tasks provided, create template tasks
    if (tasks && tasks.length > 0) {
      const templateTasks = tasks.map((task: any) => ({
        ...task,
        project_id: template.id,
        status: 'pending',
      }));
      await supabase.from('tasks').insert(templateTasks);
    }
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
