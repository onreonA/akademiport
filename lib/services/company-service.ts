// =====================================================
// COMPANY SERVICE
// =====================================================
// Firma yönetimi için service layer
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

import {
  BaseService,
  PaginationParams,
  ServiceResponse,
  SortParams,
} from './base-service';
export interface CompanyFilters {
  status?: string;
  industry?: string;
  size?: string;
  country?: string;
}
export interface CreateCompanyData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  website?: string;
  description?: string;
}
export interface UpdateCompanyData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  website?: string;
  description?: string;
  status?: string;
}
export class CompanyService extends BaseService {
  /**
   * Firma listesini getir
   */
  async getCompanies(
    request: NextRequest,
    filters: CompanyFilters = {},
    pagination: PaginationParams = {},
    sort: SortParams = { field: 'name', direction: 'asc' }
  ): Promise<ServiceResponse> {
    try {
      // Kullanıcı doğrulama
      const authResult = await this.authenticateUser(request);
      if (!authResult.success) {
        return authResult;
      }
      const { limit, offset } = this.preparePagination(pagination);
      // Query oluştur
      const supabase = this.getSupabase();
      let query = supabase
        .from('companies')
        .select(
          `
          id,
          name,
          description,
          logo_url,
          website,
          phone,
          address,
          city,
          country,
          industry,
          size,
          status,
          created_at,
          updated_at
        `
        )
        .order(sort.field, { ascending: sort.direction === 'asc' })
        .range(offset, offset + limit - 1);
      // Filtreleri uygula
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }
      if (filters.size) {
        query = query.eq('size', filters.size);
      }
      if (filters.country) {
        query = query.eq('country', filters.country);
      }
      // Company user ise sadece kendi company'sini göster
      if (!this.isAdmin()) {
        query = query.eq('id', this.user.company_id);
      }
      const { data: companies, error, count } = await query;
      if (error) {
        return this.handleDatabaseError(error, 'fetch companies');
      }
      return this.successResponse(
        companies || [],
        'Companies fetched successfully',
        count || companies?.length || 0
      );
    } catch (error) {
      return this.errorResponse('Failed to fetch companies');
    }
  }
  /**
   * Tek firma getir
   */
  async getCompany(
    request: NextRequest,
    companyId: string
  ): Promise<ServiceResponse> {
    try {
      // Kullanıcı doğrulama
      const authResult = await this.authenticateUser(request);
      if (!authResult.success) {
        return authResult;
      }
      // Yetki kontrolü
      if (!this.isAdmin() && companyId !== this.user.company_id) {
        return this.errorResponse('Access denied');
      }
      const supabase = this.getSupabase();
      const { data: company, error } = await supabase
        .from('companies')
        .select(
          `
          *,
          company_users(id, email, name, role, status, created_at),
          projects(id, name, status, progress, start_date, end_date)
        `
        )
        .eq('id', companyId)
        .single();
      if (error) {
        return this.handleDatabaseError(error, 'fetch company');
      }
      if (!company) {
        return this.errorResponse('Company not found');
      }
      return this.successResponse(company, 'Company fetched successfully');
    } catch (error) {
      return this.errorResponse('Failed to fetch company');
    }
  }
  /**
   * Yeni firma oluştur
   */
  async createCompany(
    request: NextRequest,
    companyData: CreateCompanyData
  ): Promise<ServiceResponse> {
    try {
      // Kullanıcı doğrulama
      const authResult = await this.authenticateUser(request);
      if (!authResult.success) {
        return authResult;
      }
      // Sadece admin firma oluşturabilir
      if (!this.isAdmin()) {
        return this.errorResponse('Only admins can create companies');
      }
      // Validasyon
      if (!companyData.name || !companyData.email) {
        return this.errorResponse('Name and email are required');
      }
      // Güvenli şifre üret
      const plainPassword = this.generateSecurePassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 12);
      // Firma oluştur
      const supabase = this.getSupabase();
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyData.name,
          description: companyData.description || null,
          website: companyData.website || null,
          phone: companyData.phone || null,
          address: companyData.address || null,
          city: companyData.city || null,
          country: companyData.country || 'Turkey',
          industry: companyData.industry || null,
          status: 'active',
        })
        .select()
        .single();
      if (companyError) {
        return this.handleDatabaseError(companyError, 'create company');
      }
      // Company user oluştur
      const { data: companyUser, error: companyUserError } = await supabase
        .from('company_users')
        .insert({
          company_id: company.id,
          email: companyData.email,
          password_hash: hashedPassword,
          name: companyData.name,
          role: 'operator',
          status: 'active',
        })
        .select()
        .single();
      if (companyUserError) {
        // Firma oluşturuldu ama kullanıcı oluşturulamadı, firma sil
        await supabase.from('companies').delete().eq('id', company.id);
        return this.handleDatabaseError(
          companyUserError,
          'create company user'
        );
      }
      return this.successResponse(
        {
          company,
          companyUser,
          password: plainPassword, // Şifreyi response'da döndür (sadece bu seferlik)
        },
        'Company created successfully'
      );
    } catch (error) {
      return this.errorResponse('Failed to create company');
    }
  }
  /**
   * Firma güncelle
   */
  async updateCompany(
    request: NextRequest,
    companyId: string,
    updateData: UpdateCompanyData
  ): Promise<ServiceResponse> {
    try {
      // Kullanıcı doğrulama
      const authResult = await this.authenticateUser(request);
      if (!authResult.success) {
        return authResult;
      }
      // Yetki kontrolü
      if (!this.isAdmin() && companyId !== this.user.company_id) {
        return this.errorResponse('Access denied');
      }
      // Firma var mı kontrol et
      const { data: existingCompany, error: fetchError } = await (
        this as any
      ).supabase
        .from('companies')
        .select('id')
        .eq('id', companyId)
        .single();
      if (fetchError || !existingCompany) {
        return this.errorResponse('Company not found');
      }
      // Güncelleme verilerini hazırla
      const updateFields: any = {};
      if (updateData.name) updateFields.name = updateData.name;
      if (updateData.description)
        updateFields.description = updateData.description;
      if (updateData.website) updateFields.website = updateData.website;
      if (updateData.phone) updateFields.phone = updateData.phone;
      if (updateData.address) updateFields.address = updateData.address;
      if (updateData.city) updateFields.city = updateData.city;
      if (updateData.country) updateFields.country = updateData.country;
      if (updateData.industry) updateFields.industry = updateData.industry;
      if (updateData.status) updateFields.status = updateData.status;
      // Firma güncelle
      const { data: company, error: updateError } = await (this as any).supabase
        .from('companies')
        .update(updateFields)
        .eq('id', companyId)
        .select()
        .single();
      if (updateError) {
        return this.handleDatabaseError(updateError, 'update company');
      }
      return this.successResponse(company, 'Company updated successfully');
    } catch (error) {
      return this.errorResponse('Failed to update company');
    }
  }
  /**
   * Firma sil
   */
  async deleteCompany(
    request: NextRequest,
    companyId: string
  ): Promise<ServiceResponse> {
    try {
      // Kullanıcı doğrulama
      const authResult = await this.authenticateUser(request);
      if (!authResult.success) {
        return authResult;
      }
      // Sadece admin firma silebilir
      if (!this.isAdmin()) {
        return this.errorResponse('Only admins can delete companies');
      }
      // Firma var mı kontrol et
      const { data: existingCompany, error: fetchError } = await (
        this as any
      ).supabase
        .from('companies')
        .select('id')
        .eq('id', companyId)
        .single();
      if (fetchError || !existingCompany) {
        return this.errorResponse('Company not found');
      }
      // Firma sil (cascade delete ile company_users da silinecek)
      const { error: deleteError } = await (this as any).supabase
        .from('companies')
        .delete()
        .eq('id', companyId);
      if (deleteError) {
        return this.handleDatabaseError(deleteError, 'delete company');
      }
      return this.successResponse(null, 'Company deleted successfully');
    } catch (error) {
      return this.errorResponse('Failed to delete company');
    }
  }
  /**
   * Firma istatistikleri
   */
  async getCompanyStats(request: NextRequest): Promise<ServiceResponse> {
    try {
      // Kullanıcı doğrulama
      const authResult = await this.authenticateUser(request);
      if (!authResult.success) {
        return authResult;
      }
      // Sadece admin istatistikleri görebilir
      if (!this.isAdmin()) {
        return this.errorResponse('Only admins can view company stats');
      }
      const supabase = this.getSupabase();
      const { data: companies, error } = await supabase
        .from('companies')
        .select('status, industry, size, country');
      if (error) {
        return this.handleDatabaseError(error, 'fetch company stats');
      }
      // İstatistikleri hesapla
      const stats = {
        total: companies?.length || 0,
        byStatus:
          companies?.reduce((acc: any, company: any) => {
            acc[company.status] = (acc[company.status] || 0) + 1;
            return acc;
          }, {}) || {},
        byIndustry:
          companies?.reduce((acc: any, company: any) => {
            acc[company.industry] = (acc[company.industry] || 0) + 1;
            return acc;
          }, {}) || {},
        bySize:
          companies?.reduce((acc: any, company: any) => {
            acc[company.size] = (acc[company.size] || 0) + 1;
            return acc;
          }, {}) || {},
        byCountry:
          companies?.reduce((acc: any, company: any) => {
            acc[company.country] = (acc[company.country] || 0) + 1;
            return acc;
          }, {}) || {},
      };
      return this.successResponse(stats, 'Company stats fetched successfully');
    } catch (error) {
      return this.errorResponse('Failed to fetch company stats');
    }
  }
  /**
   * Güvenli şifre üretme fonksiyonu
   */
  private generateSecurePassword(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
