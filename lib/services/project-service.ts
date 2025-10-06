// =====================================================
// PROJECT SERVICE
// =====================================================
// Proje yönetimi için service layer
import { NextRequest } from 'next/server';

import {
  BaseService,
  PaginationParams,
  ServiceResponse,
  SortParams,
} from './base-service';
export interface ProjectFilters {
  status?: string;
  type?: string;
  companyId?: string;
  consultantId?: string;
}
export interface CreateProjectData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  type?: string;
  status?: string;
  companyIds?: string[];
  consultantId?: string;
  adminNote?: string;
}
export interface UpdateProjectData {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  status?: string;
  consultantId?: string;
  adminNote?: string;
}
export class ProjectService extends BaseService {
  /**
   * Proje listesini getir
   */
  async getProjects(
    request: NextRequest,
    filters: ProjectFilters = {},
    pagination: PaginationParams = {},
    sort: SortParams = { field: 'created_at', direction: 'desc' }
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
        .from('projects')
        .select(
          `
          *,
          consultants:consultant_id(id, email, full_name),
          sub_projects(id, name, status, progress, task_count, completed_tasks),
          company_projects(company_id, status)
        `
        )
        .order(sort.field, { ascending: sort.direction === 'asc' })
        .range(offset, offset + limit - 1);
      // Filtreleri uygula
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.consultantId) {
        query = query.eq('consultant_id', filters.consultantId);
      }
      // Company user ise sadece kendi company'sinin projelerini göster
      if (!this.isAdmin() && filters.companyId) {
        query = query.eq('company_id', filters.companyId);
      }
      const { data: projects, error, count } = await query;
      if (error) {
        return this.handleDatabaseError(error, 'fetch projects');
      }
      // Proje verilerini formatla
      const formattedProjects =
        projects?.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description,
          startDate: project.start_date,
          endDate: project.end_date,
          type: project.type,
          status: project.status,
          progress: project.progress,
          adminNote: project.admin_note || '',
          companyName: 'Atanmış Firmalar', // company_projects tablosundan gelecek
          consultantName:
            project.consultants?.full_name ||
            project.consultants?.email ||
            'Atanmamış',
          subProjectCount: project.sub_projects?.length || 0,
          assignedCompanies: project.company_projects?.length || 0,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
        })) || [];
      return this.successResponse(
        formattedProjects,
        'Projects fetched successfully',
        count || formattedProjects.length
      );
    } catch (error) {
      return this.errorResponse('Failed to fetch projects');
    }
  }
  /**
   * Tek proje getir
   */
  async getProject(
    request: NextRequest,
    projectId: string
  ): Promise<ServiceResponse> {
    try {
      // Kullanıcı doğrulama
      const authResult = await this.authenticateUser(request);
      if (!authResult.success) {
        return authResult;
      }
      const supabase = this.getSupabase();
      const { data: project, error } = await supabase
        .from('projects')
        .select(
          `
          *,
          consultants:consultant_id(id, email, full_name),
          sub_projects(
            id,
            name,
            description,
            status,
            start_date,
            end_date,
            progress,
            tasks(id, name, status, priority, assigned_to, due_date)
          ),
          company_projects(
            company_id,
            status,
            companies(id, name, email)
          )
        `
        )
        .eq('id', projectId)
        .single();
      if (error) {
        return this.handleDatabaseError(error, 'fetch project');
      }
      if (!project) {
        return this.errorResponse('Project not found');
      }
      // Company user ise sadece kendi company'sinin projelerini göster
      if (!this.isAdmin()) {
        const hasAccess = project.company_projects?.some(
          (cp: any) => cp.company_id === this.user.company_id
        );
        if (!hasAccess) {
          return this.errorResponse('Access denied');
        }
      }
      return this.successResponse(project, 'Project fetched successfully');
    } catch (error) {
      return this.errorResponse('Failed to fetch project');
    }
  }
  /**
   * Yeni proje oluştur
   */
  async createProject(
    request: NextRequest,
    projectData: CreateProjectData
  ): Promise<ServiceResponse> {
    try {
      // Kullanıcı doğrulama
      const authResult = await this.authenticateUser(request);
      if (!authResult.success) {
        return authResult;
      }
      // Sadece admin proje oluşturabilir
      if (!this.isAdmin()) {
        return this.errorResponse('Only admins can create projects');
      }
      // Validasyon
      if (
        !projectData.name ||
        !projectData.description ||
        !projectData.startDate ||
        !projectData.endDate
      ) {
        return this.errorResponse(
          'Missing required fields: name, description, startDate, endDate'
        );
      }
      // Proje oluştur
      const supabase = this.getSupabase();
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          start_date: projectData.startDate,
          end_date: projectData.endDate,
          type: projectData.type || 'B2B',
          status: projectData.status || 'planning',
          progress: 0,
          consultant_id: projectData.consultantId || null,
          admin_note: projectData.adminNote || null,
        })
        .select()
        .single();
      if (projectError) {
        return this.handleDatabaseError(projectError, 'create project');
      }
      // Firmalara ata
      if (projectData.companyIds && projectData.companyIds.length > 0) {
        const companyProjectData = projectData.companyIds.map(
          (companyId: string) => ({
            company_id: companyId,
            project_id: project.id,
            status: 'planning',
          })
        );
        const { error: assignmentError } = await supabase
          .from('company_projects')
          .insert(companyProjectData);
        if (assignmentError) {
          // Proje oluşturuldu ama firma ataması başarısız
        }
      }
      return this.successResponse(project, 'Project created successfully');
    } catch (error) {
      return this.errorResponse('Failed to create project');
    }
  }
  /**
   * Proje güncelle
   */
  async updateProject(
    request: NextRequest,
    projectId: string,
    updateData: UpdateProjectData
  ): Promise<ServiceResponse> {
    try {
      // Kullanıcı doğrulama
      const authResult = await this.authenticateUser(request);
      if (!authResult.success) {
        return authResult;
      }
      // Proje var mı kontrol et
      const supabase = this.getSupabase();
      const { data: existingProject, error: fetchError } = await supabase
        .from('projects')
        .select('id, company_id')
        .eq('id', projectId)
        .single();
      if (fetchError || !existingProject) {
        return this.errorResponse('Project not found');
      }
      // Yetki kontrolü
      if (
        !this.isAdmin() &&
        existingProject.company_id !== this.user.company_id
      ) {
        return this.errorResponse('Access denied');
      }
      // Güncelleme verilerini hazırla
      const updateFields: any = {};
      if (updateData.name) updateFields.name = updateData.name;
      if (updateData.description)
        updateFields.description = updateData.description;
      if (updateData.startDate) updateFields.start_date = updateData.startDate;
      if (updateData.endDate) updateFields.end_date = updateData.endDate;
      if (updateData.type) updateFields.type = updateData.type;
      if (updateData.status) updateFields.status = updateData.status;
      if (updateData.consultantId)
        updateFields.consultant_id = updateData.consultantId;
      if (updateData.adminNote) updateFields.admin_note = updateData.adminNote;
      // Proje güncelle
      const { data: project, error: updateError } = await supabase
        .from('projects')
        .update(updateFields)
        .eq('id', projectId)
        .select()
        .single();
      if (updateError) {
        return this.handleDatabaseError(updateError, 'update project');
      }
      return this.successResponse(project, 'Project updated successfully');
    } catch (error) {
      return this.errorResponse('Failed to update project');
    }
  }
  /**
   * Proje sil
   */
  async deleteProject(
    request: NextRequest,
    projectId: string
  ): Promise<ServiceResponse> {
    try {
      // Kullanıcı doğrulama
      const authResult = await this.authenticateUser(request);
      if (!authResult.success) {
        return authResult;
      }
      // Sadece admin proje silebilir
      if (!this.isAdmin()) {
        return this.errorResponse('Only admins can delete projects');
      }
      // Proje var mı kontrol et
      const supabase = this.getSupabase();
      const { data: existingProject, error: fetchError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .single();
      if (fetchError || !existingProject) {
        return this.errorResponse('Project not found');
      }
      // Proje sil
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      if (deleteError) {
        return this.handleDatabaseError(deleteError, 'delete project');
      }
      return this.successResponse(null, 'Project deleted successfully');
    } catch (error) {
      return this.errorResponse('Failed to delete project');
    }
  }
  /**
   * Proje istatistikleri
   */
  async getProjectStats(request: NextRequest): Promise<ServiceResponse> {
    try {
      // Kullanıcı doğrulama
      const authResult = await this.authenticateUser(request);
      if (!authResult.success) {
        return authResult;
      }
      const supabase = this.getSupabase();
      let query = supabase.from('projects').select('status, type, progress');
      // Company user ise sadece kendi company'sinin projelerini göster
      if (!this.isAdmin()) {
        query = query.eq('company_id', this.user.company_id);
      }
      const { data: projects, error } = await query;
      if (error) {
        return this.handleDatabaseError(error, 'fetch project stats');
      }
      // İstatistikleri hesapla
      const stats = {
        total: projects?.length || 0,
        byStatus:
          projects?.reduce((acc: any, project: any) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
          }, {}) || {},
        byType:
          projects?.reduce((acc: any, project: any) => {
            acc[project.type] = (acc[project.type] || 0) + 1;
            return acc;
          }, {}) || {},
        averageProgress:
          projects?.length > 0
            ? projects.reduce(
                (sum: number, project: any) => sum + (project.progress || 0),
                0
              ) / projects.length
            : 0,
      };
      return this.successResponse(stats, 'Project stats fetched successfully');
    } catch (error) {
      return this.errorResponse('Failed to fetch project stats');
    }
  }
}
