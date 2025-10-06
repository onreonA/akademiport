import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/firma/tasks/[id]/upload
 * Firma kullanıcısı görev dosyası yükleme
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: taskId } = await params;

    // Kullanıcı kimlik doğrulama
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı kimlik doğrulaması gerekli' },
        { status: 401 }
      );
    }

    // Firma kullanıcısı kontrolü
    const COMPANY_ROLES = [
      'user',
      'operator',
      'manager',
      'firma_admin',
      'firma_kullanıcı',
    ];
    if (!COMPANY_ROLES.includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Bu işlem için firma kullanıcısı yetkisi gerekli' },
        { status: 403 }
      );
    }

    // FormData'yı parse et
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;
    const fileType = (formData.get('fileType') as string) || 'attachment';

    if (!file) {
      return NextResponse.json({ error: 'Dosya gerekli' }, { status: 400 });
    }

    // Dosya boyutu kontrolü (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Dosya boyutu 10MB'dan büyük olamaz" },
        { status: 400 }
      );
    }

    // Dosya türü kontrolü
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Desteklenmeyen dosya türü' },
        { status: 400 }
      );
    }

    // Kullanıcının company_id'sini al
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select('id, company_id, name, email')
      .eq('email', userEmail)
      .single();

    if (companyUserError || !companyUser) {
      return NextResponse.json(
        { error: 'Firma bilgisi bulunamadı' },
        { status: 404 }
      );
    }

    // Görevin bu firmaya atanıp atanmadığını kontrol et
    const { data: assignment, error: assignmentError } = await supabase
      .from('task_company_assignments')
      .select('id, status')
      .eq('task_id', taskId)
      .eq('company_id', companyUser.company_id)
      .eq('status', 'active')
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Bu görev size atanmamış veya erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    // Görev detaylarını al
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(
        `
        id,
        title,
        status,
        project_id,
        sub_project_id,
        projects!inner(
          id,
          name,
          companies!inner(
            id,
            name
          )
        )
      `
      )
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });
    }

    // Dosya adını güvenli hale getir
    const timestamp = new Date().getTime();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileExtension = sanitizedFileName.split('.').pop();
    const fileName = `${timestamp}_${sanitizedFileName}`;

    // Dosya yolunu oluştur
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'tasks', taskId);
    const filePath = join(uploadDir, fileName);

    // Upload dizinini oluştur
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Dosyayı kaydet
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Dosya bilgilerini veritabanına kaydet
    const { data: fileRecord, error: fileError } = await supabase
      .from('task_files')
      .insert({
        task_id: taskId,
        file_name: file.name,
        file_path: `/uploads/tasks/${taskId}/${fileName}`,
        file_size: file.size,
        file_type: file.type,
        file_extension: fileExtension,
        description: description || '',
        file_type_category: fileType,
        uploaded_by: companyUser.id,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (fileError) {
      return NextResponse.json(
        { error: 'Dosya bilgileri kaydedilirken hata oluştu' },
        { status: 500 }
      );
    }

    // Görev geçmişine kayıt ekle
    const { error: historyError } = await supabase.from('task_history').insert({
      task_id: taskId,
      action: 'file_uploaded',
      old_value: null,
      new_value: `Dosya yüklendi: ${file.name}`,
      user_id: companyUser.id,
      notes: `Dosya türü: ${fileType}, Boyut: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    });

    if (historyError) {
    }

    // İlgili kullanıcılara bildirim gönder
    const notificationPromises = [];

    // Proje sahibi firmaya bildirim (eğer farklı firmaysa)
    if (task.projects.companies.id !== companyUser.company_id) {
      notificationPromises.push(
        supabase.from('notifications').insert({
          user_id: task.projects.companies.id,
          title: 'Görev Dosyası',
          message: `${task.title} görevine yeni dosya yüklendi`,
          type: 'task_file_upload',
          entity_type: 'task',
          entity_id: taskId,
          metadata: {
            task_title: task.title,
            uploader: companyUser.name,
            file_name: file.name,
            file_type: fileType,
          },
        })
      );
    }

    // Danışmana bildirim (eğer varsa)
    if (task.consultant_id) {
      notificationPromises.push(
        supabase.from('notifications').insert({
          user_id: task.consultant_id,
          title: 'Görev Dosyası',
          message: `${task.title} görevine firma tarafından dosya yüklendi`,
          type: 'task_file_upload',
          entity_type: 'task',
          entity_id: taskId,
          metadata: {
            task_title: task.title,
            uploader: companyUser.name,
            file_name: file.name,
            file_type: fileType,
          },
        })
      );
    }

    // Tüm bildirimleri gönder
    await Promise.all(notificationPromises);

    const response = {
      success: true,
      message: 'Dosya başarıyla yüklendi',
      file: {
        id: fileRecord.id,
        fileName: fileRecord.file_name,
        filePath: fileRecord.file_path,
        fileSize: fileRecord.file_size,
        fileType: fileRecord.file_type,
        fileExtension: fileRecord.file_extension,
        description: fileRecord.description,
        fileTypeCategory: fileRecord.file_type_category,
        uploadedAt: fileRecord.uploaded_at,
        uploadedBy: {
          id: companyUser.id,
          name: companyUser.name,
          email: companyUser.email,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Sunucu hatası',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/firma/tasks/[id]/upload
 * Görev dosyalarını listele
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: taskId } = await params;

    // Kullanıcı kimlik doğrulama
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı kimlik doğrulaması gerekli' },
        { status: 401 }
      );
    }

    // Firma kullanıcısı kontrolü
    const COMPANY_ROLES = [
      'user',
      'operator',
      'manager',
      'firma_admin',
      'firma_kullanıcı',
    ];
    if (!COMPANY_ROLES.includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Bu işlem için firma kullanıcısı yetkisi gerekli' },
        { status: 403 }
      );
    }

    // Kullanıcının company_id'sini al
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('email', userEmail)
      .single();

    if (companyUserError || !companyUser) {
      return NextResponse.json(
        { error: 'Firma bilgisi bulunamadı' },
        { status: 404 }
      );
    }

    // Görevin bu firmaya atanıp atanmadığını kontrol et
    const { data: assignment, error: assignmentError } = await supabase
      .from('task_company_assignments')
      .select('id')
      .eq('task_id', taskId)
      .eq('company_id', companyUser.company_id)
      .eq('status', 'active')
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Bu görev size atanmamış veya erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    // Dosyaları getir
    const { data: files, error: filesError } = await supabase
      .from('task_files')
      .select(
        `
        id,
        file_name,
        file_path,
        file_size,
        file_type,
        file_extension,
        description,
        file_type_category,
        uploaded_at,
        uploaded_by,
        company_users(
          id,
          name,
          email
        ),
        users(
          id,
          full_name,
          email
        )
      `
      )
      .eq('task_id', taskId)
      .order('uploaded_at', { ascending: false });

    if (filesError) {
      return NextResponse.json(
        { error: 'Dosyalar yüklenirken hata oluştu' },
        { status: 500 }
      );
    }

    // Dosyaları formatla
    const formattedFiles =
      files?.map(file => ({
        id: file.id,
        fileName: file.file_name,
        filePath: file.file_path,
        fileSize: file.file_size,
        fileType: file.file_type,
        fileExtension: file.file_extension,
        description: file.description,
        fileTypeCategory: file.file_type_category,
        uploadedAt: file.uploaded_at,
        uploadedBy: file.company_users
          ? {
              id: file.company_users.id,
              name: file.company_users.name,
              email: file.company_users.email,
              type: 'company_user',
            }
          : file.users
            ? {
                id: file.users.id,
                name: file.users.full_name,
                email: file.users.email,
                type: 'admin_user',
              }
            : null,
      })) || [];

    return NextResponse.json({
      success: true,
      files: formattedFiles,
      total: formattedFiles.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Sunucu hatası',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
}
