import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    let query = supabase
      .from('document_categories')
      .select('*')
      .order('order_index', { ascending: true });
    if (id) {
      query = query.eq('id', id);
    }
    const { data: categories, error } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Kategoriler getirilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: id ? categories?.[0] : categories || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Kategoriler getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
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
    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { name, description, color, icon, order_index } = body;
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Kategori adı gerekli' },
        { status: 400 }
      );
    }
    // Check if category name already exists
    const { data: existingCategory, error: checkError } = await supabase
      .from('document_categories')
      .select('id')
      .eq('name', name)
      .single();
    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json(
        { success: false, error: 'Kategori kontrolü yapılamadı' },
        { status: 500 }
      );
    }
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Bu isimde bir kategori zaten mevcut' },
        { status: 400 }
      );
    }
    // Create new category
    const { data: newCategory, error: insertError } = await supabase
      .from('document_categories')
      .insert({
        name,
        description: description || '',
        color: color || '#3B82F6',
        icon: icon || 'ri-folder-line',
        order_index: order_index || 0,
        created_by: user.id,
        status: 'active',
      })
      .select()
      .single();
    if (insertError) {
      return NextResponse.json(
        { success: false, error: 'Kategori oluşturulamadı' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: newCategory,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Kategori oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
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
    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { id, name, description, color, icon, order_index, status } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Kategori ID gerekli' },
        { status: 400 }
      );
    }
    // Check if category exists
    const { data: existingCategory, error: checkError } = await supabase
      .from('document_categories')
      .select('*')
      .eq('id', id)
      .single();
    if (checkError || !existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }
    // Check if name is being changed and if it already exists
    if (name && name !== existingCategory.name) {
      const { data: nameExists, error: nameCheckError } = await supabase
        .from('document_categories')
        .select('id')
        .eq('name', name)
        .neq('id', id)
        .single();
      if (nameCheckError && nameCheckError.code !== 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Kategori adı kontrolü yapılamadı' },
          { status: 500 }
        );
      }
      if (nameExists) {
        return NextResponse.json(
          { success: false, error: 'Bu isimde bir kategori zaten mevcut' },
          { status: 400 }
        );
      }
    }
    // Update category
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (order_index !== undefined) updateData.order_index = order_index;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();
    const { data: updatedCategory, error: updateError } = await supabase
      .from('document_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Kategori güncellenemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Kategori güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Kategori ID gerekli' },
        { status: 400 }
      );
    }
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
    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    // Check if category exists
    const { data: existingCategory, error: checkError } = await supabase
      .from('document_categories')
      .select('*')
      .eq('id', id)
      .single();
    if (checkError || !existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }
    // Check if category has documents
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id')
      .eq('category_id', id)
      .limit(1);
    if (docsError) {
      return NextResponse.json(
        { success: false, error: 'Döküman kontrolü yapılamadı' },
        { status: 500 }
      );
    }
    if (documents && documents.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bu kategoriye ait dökümanlar bulunduğu için silinemez',
        },
        { status: 400 }
      );
    }
    // Delete category
    const { error: deleteError } = await supabase
      .from('document_categories')
      .delete()
      .eq('id', id);
    if (deleteError) {
      return NextResponse.json(
        { success: false, error: 'Kategori silinemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { message: 'Kategori başarıyla silindi' },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Kategori silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
