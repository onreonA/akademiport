import crypto from 'crypto';

import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// POST /api/companies/[id]/password - Şifre oluştur
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    const body = await request.json();
    const { action } = body;
    if (action === 'generate') {
      // Otomatik şifre üret
      const password = generateSecurePassword();
      const hashedPassword = await bcrypt.hash(password, 12);
      // Şifreyi veritabanına kaydet (companies tablosu)
      const { data, error } = await supabase
        .from('companies')
        .update({
          password: hashedPassword,
          password_updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        return NextResponse.json(
          { error: 'Şifre güncellenirken hata oluştu' },
          { status: 500 }
        );
      }
      // company_users tablosunu da güncelle
      const { error: userUpdateError } = await supabase
        .from('company_users')
        .update({
          password_hash: hashedPassword,
        })
        .eq('company_id', id);
      if (userUpdateError) {
        return NextResponse.json(
          { error: 'Kullanıcı şifresi güncellenirken hata oluştu' },
          { status: 500 }
        );
      }
      // Şifre geçmişine kaydet
      await supabase.from('company_password_history').insert({
        company_id: id,
        password_hash: hashedPassword,
      });
      return NextResponse.json({
        success: true,
        password: password, // Sadece ilk kez göster
        message: 'Şifre başarıyla oluşturuldu',
      });
    } else if (action === 'reset') {
      // Şifre sıfırlama token'ı oluştur
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 saat geçerli
      // Token'ı veritabanına kaydet
      const { error: tokenError } = await supabase
        .from('company_password_reset_tokens')
        .insert({
          company_id: id,
          token: token,
          expires_at: expiresAt.toISOString(),
        });
      if (tokenError) {
        return NextResponse.json(
          { error: 'Token oluşturulurken hata oluştu' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        token: token,
        expires_at: expiresAt.toISOString(),
        message: "Şifre sıfırlama token'ı oluşturuldu",
      });
    } else if (action === 'update') {
      const { token, newPassword } = body;
      if (!token || !newPassword) {
        return NextResponse.json(
          { error: 'Token ve yeni şifre gerekli' },
          { status: 400 }
        );
      }
      // Token'ı kontrol et
      const { data: tokenData, error: tokenCheckError } = await supabase
        .from('company_password_reset_tokens')
        .select('*')
        .eq('token', token)
        .eq('company_id', id)
        .single();
      if (tokenCheckError || !tokenData) {
        return NextResponse.json({ error: 'Geçersiz token' }, { status: 400 });
      }
      if (tokenData.used_at) {
        return NextResponse.json(
          { error: 'Token zaten kullanılmış' },
          { status: 400 }
        );
      }
      if (new Date() > new Date(tokenData.expires_at)) {
        return NextResponse.json(
          { error: 'Token süresi dolmuş' },
          { status: 400 }
        );
      }
      // Yeni şifreyi hash'le
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      // Şifreyi güncelle (companies tablosu)
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          password: hashedPassword,
          password_updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (updateError) {
        return NextResponse.json(
          { error: 'Şifre güncellenirken hata oluştu' },
          { status: 500 }
        );
      }
      // company_users tablosunu da güncelle
      const { error: userUpdateError } = await supabase
        .from('company_users')
        .update({
          password_hash: hashedPassword,
        })
        .eq('company_id', id);
      if (userUpdateError) {
        return NextResponse.json(
          { error: 'Kullanıcı şifresi güncellenirken hata oluştu' },
          { status: 500 }
        );
      }
      // Token'ı kullanıldı olarak işaretle
      await supabase
        .from('company_password_reset_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', tokenData.id);
      // Şifre geçmişine kaydet
      await supabase.from('company_password_history').insert({
        company_id: id,
        password_hash: hashedPassword,
      });
      return NextResponse.json({
        success: true,
        message: 'Şifre başarıyla güncellendi',
      });
    }
    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
// GET /api/companies/[id]/password - Şifre durumunu kontrol et
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    const { data: company, error } = await supabase
      .from('companies')
      .select('password, password_created_at, password_updated_at')
      .eq('id', id)
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Firma bilgileri alınamadı' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      has_password: !!company.password,
      password_created_at: company.password_created_at,
      password_updated_at: company.password_updated_at,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
// Güvenli şifre üretme fonksiyonu
function generateSecurePassword(): string {
  const length = 12;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  // En az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  // Kalan karakterleri rastgele doldur
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  // Şifreyi karıştır
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
