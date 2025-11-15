/**
 * List Consultant Companies Use Case
 * Sprint 7: Consultant Management
 *
 * Consultant'ın belirli bir programdaki firmalarını listeler
 */

import { Result } from '@/core/result/Result';
import { UserRole } from '@/3-domain/enums/UserRole';
import type { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import type { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import type { IProgramRepository } from '@/3-domain/interfaces/IProgramRepository';
import type {
  ConsultantCompanyWithStats,
  ConsultantCompanyListResponse,
  ConsultantCompanyFilterDto,
} from '@/application/dto/consultant';

/**
 * ListConsultantCompaniesUseCase
 *
 * Consultant'ın belirli bir programdaki firmalarını listeler:
 * - Authorization: Sadece atandığı programdaki firmaları görebilir
 * - Filtreleme (search, city, sector, isActive)
 * - Sıralama (name, city, sector, usersCount, lastActivityAt)
 * - Pagination
 * - Her firma için istatistikler
 */
export class ListConsultantCompaniesUseCase {
  constructor(
    private userRepository: IUserRepository,
    private companyRepository: ICompanyRepository,
    private programRepository: IProgramRepository
  ) {}

  async execute(
    userId: string,
    userRole: UserRole,
    filter: ConsultantCompanyFilterDto
  ): Promise<Result<ConsultantCompanyListResponse>> {
    try {
      // 1. Authorization: Sadece CONSULTANT ve MASTER_ADMIN erişebilir
      if (userRole !== UserRole.CONSULTANT && userRole !== UserRole.MASTER_ADMIN) {
        return Result.fail('Bu sayfaya erişim yetkiniz yok');
      }

      // 2. Consultant bu programa atanmış mı kontrol et
      if (userRole === UserRole.CONSULTANT) {
        const isAssignedResult = await this.userRepository.isProgramAssigned(
          userId,
          filter.programId
        );
        if (isAssignedResult.isFailure || !isAssignedResult.value) {
          return Result.fail('Bu programa erişim yetkiniz yok');
        }
      }

      // 3. Program bilgisini al
      const programResult = await this.programRepository.findById(filter.programId);
      if (programResult.isFailure || !programResult.value) {
        return Result.fail('Program bulunamadı');
      }
      const program = programResult.value;

      // 4. Program'daki firmaları al
      const companiesResult = await this.companyRepository.findByProgramId(filter.programId);
      if (companiesResult.isFailure) {
        return Result.fail(companiesResult.error!);
      }

      let companies = companiesResult.value!;

      // 5. Filtreleme
      companies = this.applyFilters(companies, filter);

      // 6. Her firma için istatistikleri ekle
      const companiesWithStats = await this.addStatsToCompanies(
        companies,
        filter.programId,
        program.name
      );

      // 7. Sıralama
      const sortedCompanies = this.sortCompanies(companiesWithStats, filter);

      // 8. Pagination
      const total = sortedCompanies.length;
      const totalPages = Math.ceil(total / filter.limit);
      const startIndex = (filter.page - 1) * filter.limit;
      const endIndex = startIndex + filter.limit;
      const paginatedCompanies = sortedCompanies.slice(startIndex, endIndex);

      // 9. Response oluştur
      const response: ConsultantCompanyListResponse = {
        companies: paginatedCompanies,
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages,
        programId: filter.programId,
        programName: program.name,
      };

      return Result.ok(response);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Firmalar listelenemedi');
    }
  }

  /**
   * Filtreleri uygula
   */
  private applyFilters(companies: any[], filter: ConsultantCompanyFilterDto): any[] {
    let filtered = [...companies];

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.legalName?.toLowerCase().includes(searchLower) ||
          c.sector?.toLowerCase().includes(searchLower)
      );
    }

    // City filter
    if (filter.city) {
      filtered = filtered.filter((c) => c.city === filter.city);
    }

    // Sector filter
    if (filter.sector) {
      filtered = filtered.filter((c) => c.sector === filter.sector);
    }

    // Active filter
    if (filter.isActive !== undefined) {
      filtered = filtered.filter((c) => c.isActive === filter.isActive);
    }

    return filtered;
  }

  /**
   * Her firma için istatistikleri ekle
   */
  private async addStatsToCompanies(
    companies: any[],
    programId: string,
    programName: string
  ): Promise<ConsultantCompanyWithStats[]> {
    const companiesWithStats: ConsultantCompanyWithStats[] = [];

    for (const company of companies) {
      // Kullanıcı sayısını al
      const usersResult = await this.companyRepository.getCompanyUsers(company.id);
      const users = usersResult.isSuccess ? usersResult.value! : [];
      const activeUsers = users.filter((u) => u.isActive);

      companiesWithStats.push({
        company,
        programId,
        programName,
        usersCount: users.length,
        activeUsersCount: activeUsers.length,
        // Sprint 8-9 için placeholder
        tasksCount: 0,
        completedTasksCount: 0,
        trainingsCount: 0,
        completedTrainingsCount: 0,
        lastActivityAt: company.updatedAt,
      });
    }

    return companiesWithStats;
  }

  /**
   * Firmaları sırala
   */
  private sortCompanies(
    companies: ConsultantCompanyWithStats[],
    filter: ConsultantCompanyFilterDto
  ): ConsultantCompanyWithStats[] {
    const sorted = [...companies];

    sorted.sort((a, b) => {
      let compareValue = 0;

      switch (filter.sortBy) {
        case 'name':
          compareValue = a.company.name.localeCompare(b.company.name, 'tr');
          break;
        case 'city':
          compareValue = (a.company.city || '').localeCompare(b.company.city || '', 'tr');
          break;
        case 'sector':
          compareValue = (a.company.sector || '').localeCompare(b.company.sector || '', 'tr');
          break;
        case 'usersCount':
          compareValue = a.usersCount - b.usersCount;
          break;
        case 'lastActivityAt':
          compareValue = (a.lastActivityAt?.getTime() || 0) - (b.lastActivityAt?.getTime() || 0);
          break;
        default:
          compareValue = 0;
      }

      return filter.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }
}
