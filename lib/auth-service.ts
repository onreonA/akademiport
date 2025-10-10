import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { createClient } from '@/lib/supabase/server';
const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}
export interface LoginCredentials {
  email: string;
  password: string;
}
export class AuthService {
  /**
   * Kullanıcı girişi - HYBRID YAKLAŞIM:
   * - Company kullanıcıları: önce company_users tablosu
   * - Admin kullanıcıları: sonra users tablosu
   */
  async signIn(
    credentials: LoginCredentials
  ): Promise<{ user: AuthUser; session: AuthSession }> {
    const supabase = createClient();
    const { email, password } = credentials;

    let userData: any = null;
    let userError: any = null;

    try {
      // HYBRID YAKLAŞIM: Önce company_users tablosundan kontrol et
      const { data: companyUser, error: companyUserError } = await supabase
        .from('company_users')
        .select('*')
        .eq('email', email)
        .single();

      if (companyUser && !companyUserError) {
        // Company user bulundu - şifre kontrolü
        const isPasswordValid = await bcrypt.compare(
          password,
          companyUser.password_hash
        );
        if (!isPasswordValid) {
          throw new Error('Invalid login credentials');
        }

        // Company user için role mapping - STANDARDIZED
        userData = {
          id: companyUser.id,
          email: companyUser.email,
          full_name: companyUser.name,
          role: companyUser.role === 'admin' ? 'firma_admin' : 'firma_kullanici',
          company_id: companyUser.company_id,
          created_at: companyUser.created_at,
          updated_at: companyUser.updated_at,
        };
      } else {
        // Company user bulunamadı - users tablosundan kontrol et (admin kullanıcıları)
        const { data: adminUser, error: adminError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (adminUser && !adminError) {
          // Admin user bulundu - şifre kontrolü
          const isPasswordValid = await bcrypt.compare(
            password,
            adminUser.password_hash
          );
          if (!isPasswordValid) {
            throw new Error('Invalid login credentials');
          }

          // Admin user için role mapping - STANDARDIZED
          userData = adminUser;
          userData.role = adminUser.role || 'admin';
        } else {
          userError = companyUserError || adminError;
        }
      }
    } catch (error) {
      userError = error;
    }

    if (!userData || userError) {
      throw new Error('User not found or invalid credentials');
    }
    // JWT token oluştur
    const accessToken = this.generateAccessToken(userData);
    const refreshToken = this.generateRefreshToken(userData);
    const user: AuthUser = {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name || userData.name,
      role: userData.role,
      company_id: userData.company_id,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    };
    const session: AuthSession = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600, // 1 hour
      token_type: 'bearer',
      user,
    };
    return { user, session };
  }
  /**
   * JWT token doğrulama
   */
  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      // Token'dan user bilgilerini al
      const user: AuthUser = {
        id: decoded.id,
        email: decoded.email,
        full_name: decoded.full_name,
        role: decoded.role,
        company_id: decoded.company_id,
        created_at: decoded.created_at,
        updated_at: decoded.updated_at,
      };
      return user;
    } catch (error) {
      return null;
    }
  }
  /**
   * Refresh token ile yeni access token oluştur
   */
  async refreshSession(
    refreshToken: string
  ): Promise<{ user: AuthUser; session: AuthSession } | null> {
    try {
      const supabase = createClient();
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;

      // HYBRID YAKLAŞIM: Önce company_users tablosundan kontrol et
      const { data: companyUserData, error: companyError } = await supabase
        .from('company_users')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (companyUserData && !companyError) {
        const user: AuthUser = {
          id: companyUserData.id,
          email: companyUserData.email,
          full_name: companyUserData.name,
          role: companyUserData.role === 'admin' ? 'firma_admin' : 'firma_kullanici',
          company_id: companyUserData.company_id,
          created_at: companyUserData.created_at,
          updated_at: companyUserData.updated_at,
        };
        const newAccessToken = this.generateAccessToken(user);
        const newRefreshToken = this.generateRefreshToken(user);
        const session: AuthSession = {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          expires_in: 3600,
          token_type: 'bearer',
          user,
        };
        return { user, session };
      }

      // Company user bulunamadı - users tablosundan kontrol et
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (error || !userData) {
        return null;
      }
      const user: AuthUser = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role || 'admin',
        company_id: userData.company_id,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      };
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);
      const session: AuthSession = {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: 3600,
        token_type: 'bearer',
        user,
      };
      return { user, session };
    } catch (error) {
      return null;
    }
  }
  /**
   * Access token oluştur
   */
  private generateAccessToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        full_name: user.full_name || user.name,
        role: user.role,
        company_id: user.company_id,
        created_at: user.created_at,
        updated_at: user.updated_at,
        type: 'access',
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  }
  /**
   * Refresh token oluştur
   */
  private generateRefreshToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: 'refresh',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
  /**
   * Kullanıcı çıkışı
   */
  async signOut(): Promise<void> {
    // JWT tabanlı sistemde server-side logout gerekmez
    // Client-side token temizleme yeterli
  }
}
// Singleton instance
export const authService = new AuthService();
