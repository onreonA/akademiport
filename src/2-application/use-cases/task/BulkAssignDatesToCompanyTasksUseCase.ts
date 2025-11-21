import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { ICompanyTaskDateRepository } from '@/3-domain/interfaces/repositories/ICompanyTaskDateRepository';
import { UpdateCompanyTaskDateDto } from '@/3-domain/entities/CompanyTaskDate';

export interface BulkTaskDateUpdateRequestDTO {
  taskId: string;
  dates: Array<{
    companyId: string;
    startDate?: Date | null;
    endDate?: Date | null;
  }>;
}

export interface BulkTaskDateUpdateResultDTO {
  updatedCount: number;
  errors: Array<{
    companyId?: string;
    error?: string;
    message?: string;
  }>;
}

/**
 * BulkAssignDatesToCompanyTasksUseCase
 * Görevlere firma bazlı tarih ataması yapar
 */
export class BulkAssignDatesToCompanyTasksUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly companyTaskDateRepository: ICompanyTaskDateRepository
  ) {}

  async execute(
    request: BulkTaskDateUpdateRequestDTO
  ): Promise<Result<BulkTaskDateUpdateResultDTO>> {
    try {
      const { taskId, dates } = request;

      if (!taskId || taskId.trim().length === 0) {
        return Result.fail(new AppError('Görev bilgisi eksik', 400, 'TASK_ID_MISSING'));
      }

      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        return Result.fail(new AppError('Görev bulunamadı', 404, 'TASK_NOT_FOUND'));
      }

      const errors: BulkTaskDateUpdateResultDTO['errors'] = [];
      const updates: Array<{ id: string; data: UpdateCompanyTaskDateDto }> = [];
      const creates: Array<{
        companyId: string;
        taskId: string;
        startDate: Date | null;
        endDate: Date | null;
      }> = [];

      for (const item of dates) {
        const companyId = item.companyId?.trim();
        if (!companyId) {
          errors.push({ companyId: 'unknown', message: 'Firma bilgisi eksik' });
          continue;
        }

        // Tarih validasyonu
        if (item.startDate && item.endDate && item.startDate > item.endDate) {
          errors.push({
            companyId,
            message: 'Başlangıç tarihi bitiş tarihinden sonra olamaz',
          });
          continue;
        }

        // Mevcut kaydı kontrol et
        const existing = await this.companyTaskDateRepository.findByCompanyAndTask(
          companyId,
          taskId
        );

        if (existing) {
          // Güncelle
          updates.push({
            id: existing.id,
            data: {
              startDate: item.startDate ?? null,
              endDate: item.endDate ?? null,
            },
          });
        } else {
          // Yeni kayıt oluştur
          creates.push({
            companyId,
            taskId,
            startDate: item.startDate ?? null,
            endDate: item.endDate ?? null,
          });
        }
      }

      // Toplu oluşturma
      if (creates.length > 0) {
        try {
          await this.companyTaskDateRepository.createMany(creates);
        } catch (error) {
          errors.push({
            message: error instanceof Error ? error.message : 'Tarih atamaları oluşturulamadı',
          });
        }
      }

      // Toplu güncelleme
      if (updates.length > 0) {
        try {
          await this.companyTaskDateRepository.updateMany(updates);
        } catch (error) {
          errors.push({
            message: error instanceof Error ? error.message : 'Tarih atamaları güncellenemedi',
          });
        }
      }

      const updatedCount = creates.length + updates.length;

      return Result.ok({
        updatedCount,
        errors,
      });
    } catch (error) {
      console.error('[BulkAssignDatesToCompanyTasksUseCase] Error:', error);
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Görev tarih atamaları gerçekleştirilemedi',
          500
        )
      );
    }
  }
}
