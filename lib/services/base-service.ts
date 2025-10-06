// =====================================================
// BASE SERVICE CLASS
// =====================================================
// Tüm service'ler için temel sınıf
import { NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
}
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}
export class BaseService {
  protected userEmail: string | null = null;
  protected user: any = null;
  constructor() {
    // createClient()'ı constructor'da çağırmıyoruz, method'larda çağırıyoruz
  }
  /**
   * Supabase client'ı al (request scope'unda)
   */
  protected getSupabase() {
    return createClient();
  }
  /**
   * Request'ten kullanıcı bilgilerini al ve doğrula
   */
  protected async authenticateUser(
    request: NextRequest
  ): Promise<ServiceResponse> {
    try {
      this.userEmail = request.headers.get('X-User-Email');
      if (!this.userEmail) {
        return {
          success: false,
          error: 'User email required',
        };
      }
      // Kullanıcı bilgilerini al - hem users hem de company_users tablolarından ara
      const supabase = this.getSupabase();
      let user = null;
      let userError = null;
      // Önce users tablosundan ara (admin kullanıcıları)
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('id, role, company_id, email, full_name')
        .eq('email', this.userEmail)
        .single();
      if (adminUser) {
        user = adminUser;
      } else {
        // Users tablosunda bulunamadıysa company_users tablosundan ara
        const { data: companyUser, error: companyError } = await supabase
          .from('company_users')
          .select('id, role, company_id, email, name as full_name')
          .eq('email', this.userEmail)
          .single();
        if (companyUser) {
          user = companyUser;
        } else {
          userError = companyError;
        }
      }
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }
      this.user = user;
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Authentication failed',
      };
    }
  }
  /**
   * Admin yetkisi kontrolü
   */
  protected isAdmin(): boolean {
    return this.user?.role === 'admin' || this.user?.role === 'master_admin';
  }
  /**
   * Company user yetkisi kontrolü
   */
  protected isCompanyUser(): boolean {
    return ['operator', 'manager', 'admin'].includes(this.user?.role);
  }
  /**
   * Belirli bir company'ye erişim yetkisi kontrolü
   */
  protected hasCompanyAccess(companyId: string): boolean {
    if (this.isAdmin()) return true;
    return this.user?.company_id === companyId;
  }
  /**
   * Pagination parametrelerini hazırla
   */
  protected preparePagination(params: PaginationParams) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100); // Max 100
    const offset = params.offset || (page - 1) * limit;
    return { page, limit, offset };
  }
  /**
   * Sort parametrelerini hazırla
   */
  protected prepareSort(params: SortParams) {
    return {
      field: params.field,
      direction: params.direction,
    };
  }
  /**
   * Başarılı response oluştur
   */
  protected successResponse<T>(
    data: T,
    message?: string,
    total?: number
  ): ServiceResponse<T> {
    return {
      success: true,
      data,
      message,
      total,
    };
  }
  /**
   * Hata response oluştur
   */
  protected errorResponse(error: string, statusCode?: number): ServiceResponse {
    return {
      success: false,
      error,
    };
  }
  /**
   * Database hatasını işle
   */
  protected handleDatabaseError(
    error: any,
    operation: string
  ): ServiceResponse {
    // Yaygın hata türlerini işle
    if (error.code === '23505') {
      return this.errorResponse('Duplicate entry found');
    }
    if (error.code === '23503') {
      return this.errorResponse('Referenced record not found');
    }
    if (error.code === '23514') {
      return this.errorResponse('Data validation failed');
    }
    return this.errorResponse(`Failed to ${operation}`);
  }
  /**
   * Request body'den JSON parse et
   */
  protected async parseRequestBody(request: NextRequest): Promise<any> {
    try {
      return await request.json();
    } catch (error) {
      throw new Error('Invalid JSON in request body');
    }
  }
  /**
   * URL search params'ları parse et
   */
  protected parseSearchParams(request: NextRequest): URLSearchParams {
    return new URL(request.url).searchParams;
  }
}
