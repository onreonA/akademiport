/**
 * API Route: CMS Media Upload
 * Sprint 23: CMS
 *
 * POST /api/cms/media/upload - Upload media to Supabase Storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { logger } from '@/5-shared/utils/logger';

/**
 * POST /api/cms/media/upload
 * Upload a media file to Supabase Storage (cms-media bucket)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Check if user is master_admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'master_admin') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = 'cms-media';

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Dosya boyutu maksimum ${maxSize / (1024 * 1024)}MB olabilir` },
        { status: 400 }
      );
    }

    // Validate file type (only images and videos)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/ogg',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Desteklenmeyen dosya tipi. Sadece görsel ve video dosyaları yüklenebilir.',
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = `${user.id}/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      logger.error('Supabase Storage upload error:', uploadError);
      return NextResponse.json(
        { error: `Dosya yüklenemedi: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL (for public bucket) or signed URL (for private bucket)
    // For CMS media, we'll use public bucket, so we can get public URL directly
    const { data: urlData } = await supabase.storage.from(bucket).getPublicUrl(filePath);

    if (!urlData) {
      return NextResponse.json({ error: "Dosya URL'i oluşturulamadı" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        url: urlData.publicUrl,
        path: filePath,
        filename: fileName,
        originalFilename: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    });
  } catch (error) {
    logger.error('Error in POST /api/cms/media/upload:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
