import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/documents - Get education documents for company users
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user email from headers (set by frontend)
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }

    // Check if user is admin or company user
    let companyId = null;

    // First try to find as company user
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('email', userEmail)
      .single();

    if (companyUser && !companyUserError) {
      companyId = companyUser.company_id;
    } else {
      // Check if user is admin
      const { data: adminUser, error: adminUserError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (adminUserError || !adminUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      // Admin users can see all documents (companyId remains null)
    }

    // Get education documents with education set info
    const { data: documents, error } = await supabase
      .from('documents')
      .select(
        `
        id,
        title,
        description,
        file_type,
        file_size,
        file_url,
        storage_path,
        order_index,
        status,
        created_at,
        updated_at,
        total_downloads,
        last_downloaded_at,
        uploaded_by,
        set_id,
        education_sets (
          id,
          name,
          description,
          category
        )
      `
      )
      .eq('status', 'Aktif')
      .order('order_index', { ascending: true });

    // If user is company user, filter by company assignments
    if (companyId) {
      // For company users, only show documents assigned to their company
      const { data: assignedDocuments, error: assignmentError } = await supabase
        .from('company_education_assignments')
        .select('document_id')
        .eq('company_id', companyId)
        .eq('status', 'Aktif');

      if (assignmentError) {
        console.error('Assignment query error:', assignmentError);
        return NextResponse.json(
          { error: 'Failed to fetch assigned documents' },
          { status: 500 }
        );
      }

      // Filter documents to only show assigned ones
      const assignedIds = assignedDocuments?.map(ad => ad.document_id) || [];
      const filteredDocuments =
        documents?.filter(doc => assignedIds.includes(doc.id)) || [];

      return NextResponse.json({
        success: true,
        data: filteredDocuments,
      });
    }

    if (error) {
      console.error('Documents query error:', error);
      return NextResponse.json(
        { error: `Failed to fetch documents: ${error.message}` },
        { status: 500 }
      );
    }

    // For admin users, return all documents
    return NextResponse.json({
      success: true,
      data: documents || [],
    });
  } catch (error) {
    console.error('Documents API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// POST /api/documents - Upload new education document
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user email from headers
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, file_type, file_url, file_size, set_id } = body;

    if (!title || !file_type || !set_id) {
      return NextResponse.json(
        { error: 'Title, file_type and set_id are required' },
        { status: 400 }
      );
    }

    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        title,
        description,
        file_type,
        file_url,
        file_size,
        set_id,
        status: 'Aktif',
        order_index: 1,
        total_downloads: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Document creation error:', error);
      return NextResponse.json(
        { error: `Failed to create document: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Document POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
