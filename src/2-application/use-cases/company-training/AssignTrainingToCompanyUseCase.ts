import { ICompanyTrainingRepository } from '@/3-domain/interfaces/repositories/ICompanyTrainingRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { AssignTrainingToCompanyDto } from '@/3-domain/entities/CompanyTraining';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class AssignTrainingToCompanyUseCase {
  constructor(
    private companyTrainingRepository: ICompanyTrainingRepository,
    private companyRepository: ICompanyRepository,
    private trainingRepository: ITrainingRepository
  ) {}

  async execute(
    data: AssignTrainingToCompanyDto,
    assignedBy: string
  ): Promise<Result<{ id: string }>> {
    try {
      // Check if company exists
      const companyResult = await this.companyRepository.findById(data.companyId);
      if (companyResult.isFailure || !companyResult.value) {
        return Result.fail(new AppError('Company not found', 404));
      }

      // Check if training exists
      const training = await this.trainingRepository.findById(data.trainingId);
      if (!training) {
        return Result.fail(new AppError('Training not found', 404));
      }

      // Check if already assigned
      const existing = await this.companyTrainingRepository.findByCompanyAndTraining(
        data.companyId,
        data.trainingId
      );
      if (existing) {
        return Result.fail(new AppError('Training is already assigned to this company', 400));
      }

      // Assign training
      const companyTraining = await this.companyTrainingRepository.create({
        companyId: data.companyId,
        trainingId: data.trainingId,
        assignedBy,
        status: 'assigned',
      });

      return Result.ok({ id: companyTraining.id });
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to assign training to company',
          500
        )
      );
    }
  }
}
