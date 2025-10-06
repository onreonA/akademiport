import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// POST /api/upload - Upload file to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'document', 'image', 'profile', etc.
    const companyId = formData.get('company_id') as string;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!type) {
      return NextResponse.json(
        { error: 'File type is required' },
        { status: 400 }
      );
    }
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      );
    }
    // Validate file type
    const allowedTypes = {
      document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      profile: ['image/jpeg', 'image/png', 'image/webp'],
    };
    if (!allowedTypes[type as keyof typeof allowedTypes]?.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${type}` },
        { status: 400 }
      );
    }
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${type}_${timestamp}_${randomString}.${fileExtension}`;
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);
    const fileUrl = urlData.publicUrl;
    // Save file info to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        name: file.name,
        file_name: fileName,
        file_url: fileUrl,
        file_size: file.size,
        file_type: file.type,
        upload_type: type,
        company_id: companyId,
        uploaded_by: userEmail,
        status: 'active',
      })
      .select()
      .single();
    if (dbError) {
      // File was uploaded but database insert failed
      // We should clean up the uploaded file
      await supabase.storage.from('uploads').remove([fileName]);
      return NextResponse.json(
        { error: 'Failed to save file info' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        id: fileRecord.id,
        name: fileRecord.name,
        file_name: fileRecord.file_name,
        file_url: fileRecord.file_url,
        file_size: fileRecord.file_size,
        file_type: fileRecord.file_type,
        upload_type: fileRecord.upload_type,
        created_at: fileRecord.created_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// DELETE /api/upload - Delete uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }
    // Get file info from database
    const { data: fileRecord, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();
    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    // Check if user has permission to delete this file
    if (
      fileRecord.uploaded_by !== userEmail &&
      !['admin', 'master_admin'].includes(userRole || '')
    ) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('uploads')
      .remove([fileRecord.file_name]);
    if (storageError) {
    }
    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);
    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to delete file record' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
