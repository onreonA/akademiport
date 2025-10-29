/**
 * Get Consultant Dashboard Use Case
 * Sprint 7: Consultant Management
 *
 * Consultant dashboard için gerekli tüm verileri toplar
 */

import { Result } from '@/core/result/Result';
import { UserRole } from '@/domain/enums/UserRole';
import { ProgramStatus } from '@/domain/enums/ProgramStatus';
import type { IUserRepository } from '@/domain/interfaces/IUserRepository';
import type { ICompanyRepository } from '@/domain/interfaces/ICompanyRepository';
import type {
  ConsultantDashboardData,
  ConsultantDashboardStats,
} from '@/application/dto/consultant';

/**
 * GetConsultantDashboardUseCase
 *
 * Consultant'ın dashboard'u için gerekli tüm verileri toplar:
 * - İstatistikler (program sayısı, firma sayısı, etc.)
 * - Son programlar
 * - Son firmalar
 */
export class GetConsultantDashboardUseCase {
  constructor(
    private userRepository: IUserRepository,
    private companyRepository: ICompanyRepository
  ) {}

  async execute(userId: string, userRole: UserRole): Promise<Result<ConsultantDashboardData>> {
    try {
      // 1. Authorization: Sadece CONSULTANT ve MASTER_ADMIN erişebilir
      if (userRole !== UserRole.CONSULTANT && userRole !== UserRole.MASTER_ADMIN) {
        return Result.fail('Bu sayfaya erişim yetkiniz yok');
      }

      // 2. Consultant'ın programlarını al
      const programsResult = await this.userRepository.getPrograms(userId);
      if (programsResult.isFailure) {
        return Result.fail(programsResult.error!);
      }

      const programs = programsResult.value!;

      // 3. İstatistikleri hesapla
      const stats = await this.calculateStats(userId, programs);

      // 4. Son programları al (en fazla 5)
      const recentPrograms = programs
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 5);

      // 5. Son firmaları al (tüm programlardan)
      const recentCompanies = await this.getRecentCompanies(programs.map((p) => p.id));

      // 6. Dashboard data'yı oluştur
      const dashboardData: ConsultantDashboardData = {
        stats,
        recentPrograms,
        recentCompanies,
      };

      return Result.ok(dashboardData);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Dashboard verileri alınamadı');
    }
  }

  /**
   * İstatistikleri hesapla
   */
  private async calculateStats(userId: string, programs: any[]): Promise<ConsultantDashboardStats> {
    // Program istatistikleri
    const totalPrograms = programs.length;
    const activePrograms = programs.filter((p) => p.status === ProgramStatus.ACTIVE).length;

    // Firma istatistikleri (her program için)
    const companiesByProgram: Record<string, number> = {};
    let totalCompanies = 0;

    for (const program of programs) {
      const companiesResult = await this.companyRepository.findByProgramId(program.id);
      if (companiesResult.isSuccess) {
        const companies = companiesResult.value!;
        const activeCompanies = companies.filter((c) => c.isActive);
        companiesByProgram[program.id] = activeCompanies.length;
        totalCompanies += activeCompanies.length;
      } else {
        companiesByProgram[program.id] = 0;
      }
    }

    return {
      totalPrograms,
      activePrograms,
      totalCompanies,
      companiesByProgram,
      // Sprint 8-9 için placeholder
      totalTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      totalTrainings: 0,
      activeTrainings: 0,
    };
  }

  /**
   * Son firmaları al (tüm programlardan)
   */
  private async getRecentCompanies(programIds: string[]): Promise<
    Array<{
      id: string;
      name: string;
      programId: string;
      programName: string;
      city?: string;
      sector?: string;
      updatedAt: Date;
    }>
  > {
    const allCompanies: Array<{
      id: string;
      name: string;
      programId: string;
      programName: string;
      city?: string;
      sector?: string;
      updatedAt: Date;
    }> = [];

    for (const programId of programIds) {
      const companiesResult = await this.companyRepository.findByProgramId(programId);
      if (companiesResult.isSuccess) {
        const companies = companiesResult.value!;
        for (const company of companies) {
          allCompanies.push({
            id: company.id,
            name: company.name,
            programId: company.programId,
            programName: '', // Program name'i ayrıca alınacak
            city: company.city,
            sector: company.sector,
            updatedAt: company.updatedAt,
          });
        }
      }
    }

    // Son 10 firmayı döndür
    return allCompanies.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 10);
  }
}
