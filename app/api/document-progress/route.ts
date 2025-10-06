import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// GET - Fetch document progress for a company
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı email gerekli' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const document_id = searchParams.get('document_id');
    const set_id = searchParams.get('set_id');
    // Get company ID from email
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (companyError || !company) {
      return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 404 });
    }
    let query = supabase
      .from('document_progress')
      .select(
        `
        *,
        documents (
          id,
          title,
          description,
          file_type,
          file_size,
          order_index,
          status
        )
      `
      )
      .eq('company_id', company.id);
    // Apply filters
    if (document_id) {
      query = query.eq('document_id', document_id);
    }
    if (set_id) {
      query = query.eq('documents.set_id', set_id);
    }
    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { error: 'Döküman ilerlemesi getirilirken hata oluştu' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      data,
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
// POST - Create or update document progress
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı email gerekli' },
        { status: 401 }
      );
    }
    // Get company ID from email
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (companyError || !company) {
      return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 404 });
    }
    const body = await request.json();
    const { document_id, is_completed, read_duration, progress_percentage } =
      body;
    if (!document_id) {
      return NextResponse.json(
        { error: 'Döküman ID gerekli' },
        { status: 400 }
      );
    }
    // Check if document exists
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, status')
      .eq('id', document_id)
      .single();
    if (docError || !document) {
      return NextResponse.json(
        { error: 'Döküman bulunamadı' },
        { status: 404 }
      );
    }
    // Check if document is active
    if (document.status !== 'Aktif') {
      return NextResponse.json(
        { error: 'Bu döküman aktif değil' },
        { status: 400 }
      );
    }
    // Check if progress already exists
    const { data: existingProgress, error: progressError } = await supabase
      .from('document_progress')
      .select('id')
      .eq('company_id', company.id)
      .eq('document_id', document_id)
      .single();
    let result;
    if (existingProgress) {
      // Update existing progress
      const updateData: any = {
        last_read_at: new Date().toISOString(),
      };
      if (is_completed !== undefined) updateData.is_completed = is_completed;
      if (read_duration !== undefined) updateData.read_duration = read_duration;
      if (progress_percentage !== undefined)
        updateData.progress_percentage = progress_percentage;
      const { data: updatedProgress, error } = await supabase
        .from('document_progress')
        .update(updateData)
        .eq('id', existingProgress.id)
        .select()
        .single();
      if (error) {
        return NextResponse.json(
          { error: 'Döküman ilerlemesi güncellenirken hata oluştu' },
          { status: 500 }
        );
      }
      result = updatedProgress;
    } else {
      // Create new progress
      const { data: newProgress, error } = await supabase
        .from('document_progress')
        .insert({
          company_id: company.id,
          document_id,
          is_completed: is_completed || false,
          read_duration: read_duration || 0,
          progress_percentage: progress_percentage || 0,
          last_read_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) {
        return NextResponse.json(
          { error: 'Döküman ilerlemesi oluşturulurken hata oluştu' },
          { status: 500 }
        );
      }
      result = newProgress;
    }
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Döküman ilerlemesi başarıyla kaydedildi',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
