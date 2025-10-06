import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET /api/documents - Get documents with optional company filter
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    // Build query
    let query = supabase
      .from('documents')
      .select(
        `
        id,
        name,
        type,
        status,
        file_url,
        file_size,
        created_at,
        updated_at,
        company_id,
        companies (
          id,
          name,
          email
        )
      `
      )
      .order('created_at', { ascending: false });
    // Apply filters
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }
    const { data: documents, error } = await query;
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: documents || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// POST /api/documents - Upload new document
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { name, type, file_url, file_size, company_id } = body;
    if (!name || !type || !company_id) {
      return NextResponse.json(
        { error: 'Name, type and company_id are required' },
        { status: 400 }
      );
    }
    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        name,
        type,
        file_url,
        file_size,
        company_id,
        status: 'pending',
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create document' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: document,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
