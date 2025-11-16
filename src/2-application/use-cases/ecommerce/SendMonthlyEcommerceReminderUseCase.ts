import { IEcommerceRepository } from '@/3-domain/interfaces/repositories/IEcommerceRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export interface MonthlyReminderResult {
  companiesNotified: number;
  companiesSkipped: number;
  errors: string[];
}

export class SendMonthlyEcommerceReminderUseCase {
  constructor(
    private ecommerceRepository: IEcommerceRepository,
    private companyRepository: ICompanyRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(): Promise<Result<MonthlyReminderResult>> {
    try {
      const errors: string[] = [];
      let companiesNotified = 0;
      let companiesSkipped = 0;

      // Get current date
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1-12

      // Get last month
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      // Get all active companies
      const companiesResult = await this.companyRepository.findAll();
      if (companiesResult.isFailure) {
        return Result.fail(
          new AppError(
            companiesResult.error instanceof Error
              ? companiesResult.error.message
              : 'Firmalar alınamadı',
            500
          )
        );
      }

      // Filter active companies
      const companies = (companiesResult.value || []).filter((company) => company.isActive);

      // Check each company
      for (const company of companies) {
        try {
          // Check if company has metrics for last month
          const metricsResult = await this.ecommerceRepository.listMetrics({
            companyId: company.id,
            programId: company.programId,
            periodYear: lastMonthYear,
            periodMonth: lastMonth,
          });

          if (metricsResult.isFailure) {
            errors.push(`Firma ${company.name}: Metrikler kontrol edilemedi`);
            companiesSkipped++;
            continue;
          }

          // If no metrics found, send reminder
          if (!metricsResult.value || metricsResult.value.length === 0) {
            // Get company admin users
            const usersResult = await this.userRepository.findByCompanyId(company.id);
            if (usersResult.isFailure) {
              errors.push(`Firma ${company.name}: Kullanıcılar alınamadı`);
              companiesSkipped++;
              continue;
            }

            const adminUsers =
              usersResult.value?.filter(
                (user) => user.role === 'company_admin' || user.role === 'company_user'
              ) || [];

            // TODO: Send email notification to admin users
            // For now, just log
            console.log(
              `Reminder: Company ${company.name} needs to enter metrics for ${lastMonthYear}-${lastMonth}`
            );

            companiesNotified++;
          } else {
            companiesSkipped++;
          }
        } catch (error) {
          errors.push(
            `Firma ${company.name}: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
          );
          companiesSkipped++;
        }
      }

      return Result.ok({
        companiesNotified,
        companiesSkipped,
        errors,
      });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Hatırlatma gönderilemedi', 500)
      );
    }
  }
}
