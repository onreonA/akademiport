import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET /api/projects/[id]/comments - Get project comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
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
    // Check project access
    const { data: project } = await supabase
      .from('projects')
      .select('company_id')
      .eq('id', id)
      .single();
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (
      (userData as any).role !== 'admin' &&
      project.company_id !== (userData as any).company_id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    // Get comments with user info
    const { data: comments, error } = await supabase
      .from('project_comments')
      .select(
        `
        *,
        users(email, full_name),
        company_users(email, full_name),
        replies:project_comments!parent_comment_id(
          *,
          users(email, full_name),
          company_users(email, full_name)
        )
      `
      )
      .eq('project_id', id)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }
    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// POST /api/projects/[id]/comments - Add comment to project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
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
      .select('role, company_id, id as company_user_id')
      .eq('email', user.email)
      .single();
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Check project access
    const { data: project } = await supabase
      .from('projects')
      .select('company_id')
      .eq('id', id)
      .single();
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (
      (userData as any).role !== 'admin' &&
      project.company_id !== (userData as any).company_id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    const body = await request.json();
    const { comment_text, parent_comment_id } = body;
    if (!comment_text) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }
    // Create comment
    const { data: comment, error } = await supabase
      .from('project_comments')
      .insert({
        project_id: id,
        comment_text,
        parent_comment_id,
        company_user_id: (userData as any).company_user_id,
      })
      .select(
        `
        *,
        company_users(email, full_name)
      `
      )
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
