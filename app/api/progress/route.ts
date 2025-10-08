import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }

    // Get user's company ID
    const { data: userCompany, error: companyError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('email', userEmail)
      .single();

    if (companyError || !userCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const companyId = userCompany.company_id;

    // Get education sets - simplified (no assignment table yet)
    const { data: educationSets, error: setsError } = await supabase
      .from('education_sets')
      .select(
        `
        id,
        name,
        description,
        category,
        status,
        video_count,
        document_count,
        total_duration
      `
      )
      .eq('status', 'Aktif');

    if (setsError) {
      console.error('Education sets error:', setsError);
      return NextResponse.json(
        { error: 'Failed to fetch education sets' },
        { status: 500 }
      );
    }

    // Get documents assigned to company
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select(
        `
        id,
        title,
        file_type,
        status,
        set_id,
        company_document_assignments!inner(
          company_id,
          progress,
          completed_at,
          status
        ),
        education_sets!inner(
          id,
          name
        )
      `
      )
      .eq('company_document_assignments.company_id', companyId)
      .eq('company_document_assignments.status', 'Aktif')
      .eq('status', 'Aktif');

    if (docsError) {
      console.error('Documents error:', docsError);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    // Get videos - simplified (no assignment table yet)
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select(
        `
        id,
        title,
        duration,
        set_id,
        status
      `
      )
      .eq('status', 'Aktif');

    if (videosError) {
      console.error('Videos error:', videosError);
      return NextResponse.json(
        { error: 'Failed to fetch videos' },
        { status: 500 }
      );
    }

    // Calculate actual video counts for progress data
    const transformedSets = await Promise.all(
      educationSets?.map(async (set: any) => {
        const { data: videos } = await supabase
          .from('videos')
          .select('id')
          .eq('set_id', set.id)
          .eq('status', 'Aktif');

        const { data: documents } = await supabase
          .from('documents')
          .select('id')
          .eq('set_id', set.id)
          .eq('status', 'Aktif');

        return {
          id: set.id,
          name: set.name,
          description: set.description,
          category: set.category,
          video_count: videos?.length || 0,
          document_count: documents?.length || 0,
          total_duration: set.total_duration || 0,
          progress_percentage: Math.floor(Math.random() * 100), // Mock progress for now
          isLocked: false,
        };
      }) || []
    );

    const transformedDocuments =
      documents?.map(doc => ({
        id: doc.id,
        title: doc.title,
        file_type: doc.file_type,
        progress_percentage:
          doc.company_document_assignments?.[0]?.progress || 0,
        is_completed: doc.company_document_assignments?.[0]?.completed_at
          ? true
          : false,
      })) || [];

    const transformedVideos =
      videos?.map(video => ({
        id: video.id,
        title: video.title,
        duration: video.duration,
        progress_percentage: Math.floor(Math.random() * 100), // Mock progress for now
        is_completed: Math.random() > 0.3, // Mock completion status
      })) || [];

    return NextResponse.json({
      success: true,
      data: {
        educationSets: transformedSets,
        documents: transformedDocuments,
        videos: transformedVideos,
      },
    });
  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
