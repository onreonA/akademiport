/**
 * List Consultant Programs Use Case
 * Sprint 7: Consultant Management
 *
 * Consultant'ın atandığı programları listeler
 */

import { Result } from '@/core/result/Result';
import { UserRole } from '@/domain/enums/UserRole';
import { ProgramStatus } from '@/domain/enums/ProgramStatus';
import type { IUserRepository } from '@/domain/interfaces/IUserRepository';
import type { ICompanyRepository } from '@/domain/interfaces/ICompanyRepository';
import type {
  ConsultantProgramWithStats,
  ConsultantProgramListResponse,
  ConsultantProgramFilterDto,
} from '@/application/dto/consultant';

/**
 * ListConsultantProgramsUseCase
 *
 * Consultant'ın atandığı programları listeler:
 * - Filtreleme (status, search)
 * - Sıralama (name, startDate, companiesCount, assignedAt)
 * - Pagination
 * - Her program için istatistikler (firma sayısı, etc.)
 */
export class ListConsultantProgramsUseCase {
  constructor(
    private userRepository: IUserRepository,
    private companyRepository: ICompanyRepository
  ) {}

  async execute(
    userId: string,
    userRole: UserRole,
    filter: ConsultantProgramFilterDto
  ): Promise<Result<ConsultantProgramListResponse>> {
    try {
      // 1. Authorization: Sadece CONSULTANT ve MASTER_ADMIN erişebilir
      if (userRole !== UserRole.CONSULTANT && userRole !== UserRole.MASTER_ADMIN) {
        return Result.fail('Bu sayfaya erişim yetkiniz yok');
      }

      // 2. Consultant'ın programlarını al
      const programsResult = await this.userRepository.getPrograms(userId);
      
      if (programsResult.isFailure) {
        // Eğer programa atanmamışsa, boş liste döndür (hata değil)
        console.warn('⚠️ User programs fetch failed:', programsResult.error);
      }

      let programs = programsResult.value || [];

      // 3. Filtreleme
      programs = this.applyFilters(programs, filter);

      // 4. Her program için istatistikleri ekle
      const programsWithStats = await this.addStatsToPrograms(programs);

      // 5. Sıralama
      const sortedPrograms = this.sortPrograms(programsWithStats, filter);

      // 6. Pagination
      const total = sortedPrograms.length;
      const totalPages = Math.ceil(total / filter.limit);
      const startIndex = (filter.page - 1) * filter.limit;
      const endIndex = startIndex + filter.limit;
      const paginatedPrograms = sortedPrograms.slice(startIndex, endIndex);

      // 7. Response oluştur
      const response: ConsultantProgramListResponse = {
        programs: paginatedPrograms,
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages,
      };

      return Result.ok(response);
    } catch (error) {
      console.error('💥 ListConsultantProgramsUseCase - Exception:', error);
      return Result.fail(error instanceof Error ? error.message : 'Programlar listelenemedi');
    }
  }

  /**
   * Filtreleri uygula
   */
  private applyFilters(programs: any[], filter: ConsultantProgramFilterDto): any[] {
    let filtered = [...programs];

    // Status filter
    if (filter.status) {
      filtered = filtered.filter((p) => p.status === filter.status);
    }

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.city?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  /**
   * Her program için istatistikleri ekle
   */
  private async addStatsToPrograms(programs: any[]): Promise<ConsultantProgramWithStats[]> {
    const programsWithStats: ConsultantProgramWithStats[] = [];

    for (const program of programs) {
      // Firma sayısını al
      const companiesResult = await this.companyRepository.findByProgramId(program.id);
      const companies = companiesResult.isSuccess ? companiesResult.value! : [];
      const activeCompanies = companies.filter((c) => c.isActive);

      programsWithStats.push({
        program,
        companiesCount: companies.length,
        activeCompaniesCount: activeCompanies.length,
        // Sprint 8-9 için placeholder
        tasksCount: 0,
        pendingTasksCount: 0,
        trainingsCount: 0,
        activeTrainingsCount: 0,
        // Atanma bilgisi (şimdilik default)
        assignedAt: program.createdAt,
        roleInProgram: 'consultant',
      });
    }

    return programsWithStats;
  }

  /**
   * Programları sırala
   */
  private sortPrograms(
    programs: ConsultantProgramWithStats[],
    filter: ConsultantProgramFilterDto
  ): ConsultantProgramWithStats[] {
    const sorted = [...programs];

    sorted.sort((a, b) => {
      let compareValue = 0;

      switch (filter.sortBy) {
        case 'name':
          compareValue = a.program.name.localeCompare(b.program.name, 'tr');
          break;
        case 'startDate':
          compareValue =
            new Date(a.program.startDate).getTime() - new Date(b.program.startDate).getTime();
          break;
        case 'companiesCount':
          compareValue = a.companiesCount - b.companiesCount;
          break;
        case 'assignedAt':
          compareValue = a.assignedAt.getTime() - b.assignedAt.getTime();
          break;
        default:
          compareValue = 0;
      }

      return filter.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }
}
