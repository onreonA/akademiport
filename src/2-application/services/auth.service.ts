/**
 * Authentication Service
 *
 * Kullanıcı authentication işlemleri
 */

import { createClient } from '@/infrastructure/database/supabase-server';
import { Result } from '@/core/result/Result';
import type { AuthUser, CreateUserDto } from '@/domain/entities/User';
import { UserRole } from '@/domain/enums/UserRole';

export class AuthService {
  /**
   * Sign Up - Yeni kullanıcı kaydı
   */
  static async signUp(dto: CreateUserDto): Promise<Result<AuthUser>> {
    try {
      const supabase = await createClient();

      // 1. Supabase Auth'da kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dto.email,
        password: dto.password,
        options: {
          data: {
            full_name: dto.fullName,
            role: dto.role || UserRole.COMPANY_USER,
          },
        },
      });

      if (authError) {
        return Result.fail(authError.message);
      }

      if (!authData.user) {
        return Result.fail('Kullanıcı oluşturulamadı');
      }

      // 2. Users tablosuna ekle
      const { error: insertError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: dto.email,
        full_name: dto.fullName,
        phone: dto.phone,
        role: dto.role || UserRole.COMPANY_USER,
        company_id: dto.companyId,
        is_active: true,
        is_email_verified: false,
      });

      if (insertError) {
        return Result.fail(insertError.message);
      }

      // 3. AuthUser döndür
      const authUser: AuthUser = {
        id: authData.user.id,
        email: dto.email,
        fullName: dto.fullName,
        role: dto.role || UserRole.COMPANY_USER,
        companyId: dto.companyId,
      };

      return Result.ok(authUser);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kayıt sırasında hata oluştu');
    }
  }

  /**
   * Sign In - Kullanıcı girişi
   */
  static async signIn(email: string, password: string): Promise<Result<AuthUser>> {
    try {
      const supabase = await createClient();

      // 1. Supabase Auth ile giriş yap
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return Result.fail('Email veya şifre hatalı');
      }

      if (!authData.user) {
        return Result.fail('Giriş başarısız');
      }

      // 2. Users tablosundan kullanıcı bilgilerini al
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        return Result.fail('Kullanıcı bulunamadı');
      }

      // 3. Aktif mi kontrol et
      if (!userData.is_active) {
        return Result.fail('Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin.');
      }

      // 4. Last login güncelle
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', authData.user.id);

      // 5. AuthUser döndür
      const authUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role as UserRole,
        avatarUrl: userData.avatar_url,
        companyId: userData.company_id,
      };

      return Result.ok(authUser);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Giriş sırasında hata oluştu');
    }
  }

  /**
   * Sign Out - Çıkış yap
   */
  static async signOut(): Promise<Result<void>> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Çıkış sırasında hata oluştu');
    }
  }

  /**
   * Get Current User - Mevcut kullanıcıyı al
   */
  static async getCurrentUser(): Promise<Result<AuthUser | null>> {
    try {
      const supabase = await createClient();

      // 1. Supabase Auth'dan session al
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return Result.ok(null);
      }

      // 2. Users tablosundan kullanıcı bilgilerini al
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        return Result.ok(null);
      }

      // 3. AuthUser döndür
      const authUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role as UserRole,
        avatarUrl: userData.avatar_url,
        companyId: userData.company_id,
      };

      return Result.ok(authUser);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Kullanıcı bilgileri alınırken hata oluştu'
      );
    }
  }

  /**
   * Reset Password Request - Şifre sıfırlama isteği
   */
  static async resetPasswordRequest(email: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Şifre sıfırlama isteği sırasında hata oluştu'
      );
    }
  }

  /**
   * Update Password - Şifre güncelle
   */
  static async updatePassword(newPassword: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Şifre güncellenirken hata oluştu'
      );
    }
  }
}
