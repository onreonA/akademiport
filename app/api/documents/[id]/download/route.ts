import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://frylotuwbjhqybcxvvzs.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWxvdHV3YmpocXliY3h2dnpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3ODE4OCwiZXhwIjoyMDcxMjU0MTg4fQ.kvHMECvHePaa07whhElHb11tFArkv85UwAGNPZ3qGNY'
);
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    const { id: documentId } = await params;
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Get document info
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    if (documentError || !document) {
      return NextResponse.json(
        { success: false, error: 'Döküman bulunamadı' },
        { status: 404 }
      );
    }
    // Update download count and last downloaded date
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        total_downloads: (document.total_downloads || 0) + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq('id', documentId);
    if (updateError) {
    }
    return NextResponse.json({
      success: true,
      data: {
        message: 'İndirme sayacı güncellendi',
        document: {
          id: document.id,
          title: document.title,
          file_url: document.file_url,
          file_type: document.file_type,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'İndirme işlemi sırasında hata oluştu' },
      { status: 500 }
    );
  }
}
