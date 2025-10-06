import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// POST - Upload document file
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı email gerekli' },
        { status: 401 }
      );
    }
    // Get user role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Check if user is admin
    if (user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const set_id = formData.get('set_id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const order_index = formData.get('order_index') as string;
    if (!file || !set_id || !title) {
      return NextResponse.json(
        { error: 'Dosya, eğitim seti ve başlık gerekli' },
        { status: 400 }
      );
    }
    // Validate file type
    const allowedTypes = ['pdf', 'docx', 'pptx', 'xlsx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        {
          error:
            'Geçersiz dosya türü. Sadece PDF, DOCX, PPTX, XLSX dosyaları kabul edilir.',
        },
        { status: 400 }
      );
    }
    // Validate file size (50MB limit)
    if (file.size > 52428800) {
      return NextResponse.json(
        { error: "Dosya boyutu 50MB'dan büyük olamaz" },
        { status: 400 }
      );
    }
    // Check if education set exists
    const { data: educationSet, error: setError } = await supabase
      .from('education_sets')
      .select('id, name')
      .eq('id', set_id)
      .single();
    if (setError || !educationSet) {
      return NextResponse.json(
        { error: 'Eğitim seti bulunamadı' },
        { status: 404 }
      );
    }
    // Generate unique file name
    const timestamp = Date.now();
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${sanitizedTitle}_${timestamp}.${fileExtension}`;
    const storagePath = `documents/${set_id}/${fileExtension}/${fileName}`;
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('education-documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    if (uploadError) {
      return NextResponse.json(
        { error: 'Dosya yüklenirken hata oluştu' },
        { status: 500 }
      );
    }
    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('education-documents').getPublicUrl(storagePath);
    // Create document record in database
    const { data: newDocument, error: dbError } = await supabase
      .from('documents')
      .insert({
        set_id,
        title,
        description: description || '',
        file_url: publicUrl,
        file_type: fileExtension,
        file_size: file.size,
        order_index: parseInt(order_index) || 0,
        status: 'Aktif',
        storage_path: storagePath,
        uploaded_by: user.id,
      })
      .select()
      .single();
    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('education-documents').remove([storagePath]);
      return NextResponse.json(
        { error: 'Döküman kaydedilirken hata oluştu' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        ...newDocument,
        file_url: publicUrl,
      },
      message: 'Döküman başarıyla yüklendi',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
// DELETE - Delete document file
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı email gerekli' },
        { status: 401 }
      );
    }
    // Get user role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Check if user is admin
    if (user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const document_id = searchParams.get('document_id');
    if (!document_id) {
      return NextResponse.json(
        { error: 'Döküman ID gerekli' },
        { status: 400 }
      );
    }
    // Get document info
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, storage_path')
      .eq('id', document_id)
      .single();
    if (docError || !document) {
      return NextResponse.json(
        { error: 'Döküman bulunamadı' },
        { status: 404 }
      );
    }
    // Delete file from storage
    if (document.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('education-documents')
        .remove([document.storage_path]);
      if (storageError) {
        // Continue with database deletion even if storage deletion fails
      }
    }
    // Delete document from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', document_id);
    if (dbError) {
      return NextResponse.json(
        { error: 'Döküman silinirken hata oluştu' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Döküman başarıyla silindi',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
